import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRevision extends Document {
  userId: mongoose.Types.ObjectId;
  studyLogId: mongoose.Types.ObjectId;
  dueDate: Date;
  interval: 7 | 14;
  status: 'pending' | 'done' | 'skipped';
  createdAt: Date;
}

const RevisionSchema = new Schema<IRevision>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studyLogId: { type: Schema.Types.ObjectId, ref: 'StudyLog', required: true, index: true },
  dueDate: { type: Date, required: true, index: true },
  interval: { type: Number, required: true, enum: [7, 14] },
  status: { type: String, required: true, enum: ['pending', 'done', 'skipped'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Revision: Model<IRevision> = mongoose.models.Revision || mongoose.model<IRevision>('Revision', RevisionSchema);

export default Revision;
