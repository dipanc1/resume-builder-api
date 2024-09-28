import * as mongoose from 'mongoose';

export const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
});
