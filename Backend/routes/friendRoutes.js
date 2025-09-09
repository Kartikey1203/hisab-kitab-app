import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Person from '../models/Person.js';
import FriendRequest from '../models/FriendRequest.js';
import Notification from '../models/Notification.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Send friend request by email
router.post('/request', auth, async (req, res) => {
  try {
    const { email, personId } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const toUser = await User.findOne({ email });
    if (!toUser) return res.status(404).json({ message: 'User not found' });
    if (toUser._id.equals(req.user._id)) return res.status(400).json({ message: 'Cannot friend yourself' });

    // If already friends
    const alreadyFriends = (req.user.friends || []).some((f) => f.equals(toUser._id));
    if (alreadyFriends) return res.status(400).json({ message: 'Already friends' });

    // Create or reuse pending request
    const upsert = { $setOnInsert: { status: 'pending' } };
    if (personId) upsert.$setOnInsert.linkPersonFrom = personId;
    const fr = await FriendRequest.findOneAndUpdate(
      { fromUser: req.user._id, toUser: toUser._id },
      upsert,
      { upsert: true, new: true }
    );
    if (fr.status !== 'pending') {
      fr.status = 'pending';
      await fr.save();
    }
    // Notify recipient
    await Notification.create({ user: toUser._id, type: 'friend_request', message: `${req.user.name} sent you a friend request`, metadata: { fromUser: req.user._id } });
    res.status(201).json(fr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List incoming and outgoing pending requests
router.get('/requests', auth, async (req, res) => {
  try {
    const incoming = await FriendRequest.find({ toUser: req.user._id, status: 'pending' }).populate('fromUser', 'name email');
    const outgoing = await FriendRequest.find({ fromUser: req.user._id, status: 'pending' }).populate('toUser', 'name email');
    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Respond to a friend request (accept/decline)
router.post('/respond', auth, async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accept' | 'decline'
    if (!requestId || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    const fr = await FriendRequest.findById(requestId);
    if (!fr || !fr.toUser.equals(req.user._id) || fr.status !== 'pending') {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (action === 'decline') {
      fr.status = 'declined';
      await fr.save();
      return res.json(fr);
    }

    // Accept: link users as friends
    fr.status = 'accepted';
    await fr.save();

    await User.findByIdAndUpdate(fr.fromUser, { $addToSet: { friends: fr.toUser } });
    await User.findByIdAndUpdate(fr.toUser, { $addToSet: { friends: fr.fromUser } });

    // Create Person entries for each other if not exists
    const [aUser, bUser] = [await User.findById(fr.fromUser), await User.findById(fr.toUser)];

    const ensurePersonFor = async (ownerId, friendId, friendName, preferredPersonId) => {
      if (preferredPersonId) {
        const existingPreferred = await Person.findOne({ _id: preferredPersonId, user: ownerId });
        if (existingPreferred) {
          existingPreferred.friendUser = friendId;
          await existingPreferred.save();
          return existingPreferred;
        }
      }
      let p = await Person.findOne({ user: ownerId, friendUser: friendId });
      if (!p) {
        p = await Person.create({ name: friendName, user: ownerId, friendUser: friendId });
      }
      return p;
    };

    const aPerson = await ensurePersonFor(aUser._id, bUser._id, bUser.name, fr.linkPersonFrom);
    const bPerson = await ensurePersonFor(bUser._id, aUser._id, aUser.name);

    // Link counterparts if not linked
    if (!aPerson.counterpartPerson || !aPerson.counterpartPerson.equals(bPerson._id)) {
      aPerson.counterpartPerson = bPerson._id;
      await aPerson.save();
    }
    if (!bPerson.counterpartPerson || !bPerson.counterpartPerson.equals(aPerson._id)) {
      bPerson.counterpartPerson = aPerson._id;
      await bPerson.save();
    }

    // Ensure person names reflect friend user names
    if (aPerson.name !== bUser.name) {
      aPerson.name = bUser.name;
      await aPerson.save();
    }
    if (bPerson.name !== aUser.name) {
      bPerson.name = aUser.name;
      await bPerson.save();
    }

    // Backfill transactions both ways if missing counterpart
    const backfillFor = async (sourcePersonId, targetPersonId) => {
      const txs = await Transaction.find({ person: sourcePersonId });
      for (const tx of txs) {
        if (!tx.counterpartTransaction) {
          const twin = await Transaction.create({
            amount: tx.amount,
            description: tx.description,
            date: tx.date,
            type: tx.type === 'credit' ? 'debit' : 'credit',
            person: targetPersonId,
            counterpartTransaction: tx._id,
          });
          tx.counterpartTransaction = twin._id;
          await tx.save();
        }
      }
    };
    await backfillFor(aPerson._id, bPerson._id);
    await backfillFor(bPerson._id, aPerson._id);

    // Notify both users
    await Notification.create({ user: aUser._id, type: 'friend_accepted', message: `${bUser.name} accepted your friend request`, metadata: { friend: bUser._id } });
    await Notification.create({ user: bUser._id, type: 'friend_accepted', message: `You are now friends with ${aUser.name}`, metadata: { friend: aUser._id } });
    res.json({ request: fr, aPerson, bPerson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List friends
router.get('/list', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate('friends', 'name email');
    res.json(me.friends || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

// Cancel outgoing pending friend request
router.post('/cancel', auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    const fr = await FriendRequest.findById(requestId);
    if (!fr || !fr.fromUser.equals(req.user._id) || fr.status !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found' });
    }
    fr.status = 'cancelled';
    await fr.save();
    return res.json(fr);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});


