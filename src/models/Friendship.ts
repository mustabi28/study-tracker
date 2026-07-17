import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFriendship extends Document {
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted';
  createdAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  friendId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, required: true, enum: ['pending', 'accepted'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to speed up check of friendship existence in either direction
FriendshipSchema.index({ userId: 1, friendId: 1 }, { unique: true });

const Friendship: Model<IFriendship> = mongoose.models.Friendship || mongoose.model<IFriendship>('Friendship', FriendshipSchema);

export default Friendship;
