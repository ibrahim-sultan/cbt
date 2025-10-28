import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Attempt from '../models/Attempt.js';
import ActivityLog from '../models/ActivityLog.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import { gradeAttempt } from '../utils/grading.js';

const router = Router();

// Log an activity (tab switch, copy/paste, etc.)
router.post('/log', auth, async (req, res) => {
  const { examId, attemptId, type, meta } = req.body;
  const item = await ActivityLog.create({ user: req.user.id, exam: examId, attempt: attemptId, type, meta });
  res.status(201).json(item);
});

// List active attempts
router.get('/active', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const items = await Attempt.find({ status: 'in_progress' }).populate('student', 'name email');
  res.json(items);
});

// Logs: list by attempt or exam
router.get('/logs', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const { attemptId, examId, limit = 200 } = req.query;
  const filter = {};
  if (attemptId) filter.attempt = attemptId;
  if (examId) filter.exam = examId;
  const items = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(items);
});

// Logs stats per attempt (counts by type)
router.get('/stats', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const { examId } = req.query;
  const match = examId ? { exam: examId } : {};
  const agg = await ActivityLog.aggregate([
    { $match: match },
    { $group: { _id: { attempt: '$attempt', type: '$type' }, count: { $sum: 1 } } },
  ]);
  const result = {};
  for (const r of agg) {
    const aid = String(r._id.attempt);
    result[aid] = result[aid] || {};
    result[aid][r._id.type] = r.count;
  }
  res.json(result);
});

// Force submit an attempt
router.post('/:attemptId/force-submit', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const { attemptId } = req.params;
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

  attempt.submittedAt = new Date();
  attempt.status = 'submitted';

  const exam = await Exam.findById(attempt.exam);
  const questions = await Question.find({ _id: { $in: attempt.questions } });
  const { score, details, hasSubjective } = gradeAttempt({ exam, questions, answers: attempt.answers || [] });

  attempt.score = score;
  attempt.status = hasSubjective ? 'submitted' : 'graded';
  await attempt.save();

  res.json({ attempt, details });
});

export default router;
