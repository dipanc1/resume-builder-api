import * as mongoose from 'mongoose';

export const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  image: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
});
