import mongoose from 'mongoose';

const MarkingSchema = new mongoose.Schema({ correct: { type: Number, default: 1 }, wrong: { type: Number, default: 0 } }, { _id: false });

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    startAt: Date,
    endAt: Date,
    groupIds: [String],
    questionCount: { type: Number, default: 20 },
    marking: { type: MarkingSchema, default: () => ({}) },
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    allowTabSwitching: { type: Boolean, default: false },
    antiCheat: { type: Boolean, default: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Exam', ExamSchema);
