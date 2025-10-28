import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Exam from '../models/Exam.js';
import Attempt from '../models/Attempt.js';
import Question from '../models/Question.js';
import { sample } from '../utils/random.js';
import { gradeAttempt } from '../utils/grading.js';

const router = Router();

// Admin create exam
router.post('/', auth, requireRole('admin', 'instructor'), async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(exam);
  } catch (e) {
    res.status(400).json({ message: 'Invalid payload' });
  }
});

// List exams (admin)
router.get('/', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const exams = await Exam.find().sort({ createdAt: -1 });
  res.json(exams);
});

// Student: my exams (basic placeholder)
router.get('/assigned', auth, async (req, res) => {
  const now = new Date();
  const exams = await Exam.find({ startAt: { $lte: now }, endAt: { $gte: now } });
  res.json(exams);
});

// Start exam (creates attempt if none) and return question ids order
router.post('/:id/start', auth, async (req, res) => {
  const examId = req.params.id;
  const exam = await Exam.findById(examId).populate('questions');
  if (!exam) return res.status(404).json({ message: 'Exam not found' });

  let attempt = await Attempt.findOne({ exam: examId, student: req.user.id });
  if (!attempt) {
    let qIds = (exam.questions || []).map((q) => q._id);
    if (exam.questionCount && qIds.length > exam.questionCount) qIds = sample(qIds, exam.questionCount);
    attempt = await Attempt.create({ exam: examId, student: req.user.id, startedAt: new Date(), questions: qIds });
  }

  res.json({ attemptId: attempt._id, questions: attempt.questions });
});

// Fetch current user's attempt with question data (no correct flags exposed)
router.get('/:id/attempt', auth, async (req, res) => {
  const examId = req.params.id;
  const attempt = await Attempt.findOne({ exam: examId, student: req.user.id });
  if (!attempt) return res.status(404).json({ message: 'No attempt found. Start exam first.' });
  const questions = await Question.find({ _id: { $in: attempt.questions } });
  const qMap = new Map(questions.map((q) => [String(q._id), q]));
  const ordered = attempt.questions.map((qid) => {
    const q = qMap.get(String(qid));
    if (!q) return null;
    return {
      _id: q._id,
      text: q.text,
      type: q.type,
      options: (q.options || []).map((o) => ({ text: o.text })) , // hide isCorrect
      imageUrl: q.imageUrl,
      subject: q.subject,
      topic: q.topic
    };
  }).filter(Boolean);
  res.json({ attemptId: attempt._id, questions: ordered });
});

// Save in-progress answers
router.patch('/:id/save', auth, async (req, res) => {
  const examId = req.params.id;
  const { answers } = req.body;
  const attempt = await Attempt.findOneAndUpdate(
    { exam: examId, student: req.user.id },
    { answers },
    { new: true }
  );
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  res.json({ ok: true });
});

// Submit exam and grade
router.post('/:id/submit', auth, async (req, res) => {
  const examId = req.params.id;
  const { answers } = req.body;
  const exam = await Exam.findById(examId);
  if (!exam) return res.status(404).json({ message: 'Exam not found' });

  const attempt = await Attempt.findOneAndUpdate(
    { exam: examId, student: req.user.id },
    { answers, submittedAt: new Date(), status: 'submitted' },
    { new: true }
  );

  const questions = await Question.find({ _id: { $in: attempt.questions } });
  const { score, details, hasSubjective } = gradeAttempt({ exam, questions, answers });

  attempt.score = score;
  attempt.status = hasSubjective ? 'submitted' : 'graded';
  await attempt.save();

  res.json({ attempt, score, details, graded: !hasSubjective });
});

// Results
router.get('/:id/results', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const examId = req.params.id;
  const items = await Attempt.find({ exam: examId }).populate('student', 'name email');
  res.json(items);
});

router.get('/results/mine', auth, async (req, res) => {
  const items = await Attempt.find({ student: req.user.id }).populate('exam', 'title startAt endAt');
  res.json(items);
});

export default router;
