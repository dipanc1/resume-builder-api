import * as mongoose from 'mongoose';

export const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, unique: true },
  content: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
