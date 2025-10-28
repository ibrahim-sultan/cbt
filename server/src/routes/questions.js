import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { auth, requireRole } from '../middleware/auth.js';
import Question from '../models/Question.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create single question
router.post('/', auth, requireRole('admin', 'instructor'), async (req, res) => {
  try {
    const q = await Question.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(q);
  } catch (e) {
    res.status(400).json({ message: 'Invalid payload' });
  }
});

// Update
router.put('/:id', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!q) return res.status(404).json({ message: 'Not found' });
  res.json(q);
});

// Delete
router.delete('/:id', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const q = await Question.findByIdAndDelete(req.params.id);
  if (!q) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

// Bulk upload via Excel/CSV
router.post('/bulk', auth, requireRole('admin', 'instructor'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'file required' });
  const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  // Expected columns: text,type,options,answer,subject,topic,tags
  // TODO: Map rows -> Question documents
  res.json({ uploaded: rows.length, message: 'Parsing not yet implemented' });
});

// List / filter
router.get('/', auth, async (req, res) => {
  const { subject, topic, q } = req.query;
  const filter = {};
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (q) filter.text = new RegExp(q, 'i');
  const items = await Question.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(items);
});

export default router;
