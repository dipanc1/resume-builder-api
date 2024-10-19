import * as mongoose from 'mongoose';

export const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, unique: true },
  content: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  imageIds: { type: [String], default: [] },
  views: { type: Number, default: 0 },
  draft: { type: Boolean, default: true },
  description: { type: String, required: true, trim: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
