import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt' },
    type: { type: String, enum: ['tab_switch', 'copy', 'paste', 'suspicious', 'info'], default: 'info' },
    meta: { type: Object }
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', ActivityLogSchema);
