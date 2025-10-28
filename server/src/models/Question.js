import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({ text: String, isCorrect: { type: Boolean, default: false } }, { _id: false });

const QuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'tf', 'short'], default: 'mcq' },
    options: [OptionSchema],
    imageUrl: String,
    subject: String,
    topic: String,
    tags: [String],
    explanation: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Question', QuestionSchema);
