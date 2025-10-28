import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOptionIndexes: [Number],
    textAnswer: String,
    isCorrect: Boolean,
    comment: String
  },
  { _id: false }
);

const AttemptSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    answers: [AnswerSchema],
    startedAt: Date,
    submittedAt: Date,
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'submitted', 'graded'], default: 'in_progress' }
  },
  { timestamps: true }
);

export default mongoose.model('Attempt', AttemptSchema);
