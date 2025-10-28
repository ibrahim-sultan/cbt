import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Group', GroupSchema);
