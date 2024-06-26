import * as mongoose from 'mongoose';

export const SaveResumeSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'template'
  },
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  data: { type: mongoose.Schema.Types.Mixed },
  rawData: { type: mongoose.Schema.Types.Mixed },
  resumeUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
