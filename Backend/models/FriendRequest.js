import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional: link an existing Person (owned by fromUser) to this friendship when accepted
    linkPersonFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

friendRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
export default FriendRequest;


