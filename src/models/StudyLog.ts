import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudyLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  subject: string;
  chapter: string;
  lesson: string;
  minutesStudied: number;
  notes?: string;
  createdAt: Date;
}

const StudyLogSchema = new Schema<IStudyLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  lesson: { type: String, required: true },
  minutesStudied: { type: Number, required: true, min: 1 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const StudyLog: Model<IStudyLog> = mongoose.models.StudyLog || mongoose.model<IStudyLog>('StudyLog', StudyLogSchema);

export default StudyLog;
