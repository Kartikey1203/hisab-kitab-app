import mongoose from 'mongoose';

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // If this person represents a linked friend, store the friend's user id
    friendUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Optional per-user nickname for this person
    nickname: {
      type: String,
      default: '',
      trim: true,
    },
    // When two users become friends, we create a Person document for each user
    // and link them together via counterpartPerson
    counterpartPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
    },
    // Optional payment address/handle (e.g., UPI or PayPal)
    paymentAddress: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Person = mongoose.model('Person', personSchema);
export default Person;