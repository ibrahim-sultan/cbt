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
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  // Expected columns (case-insensitive): text,type,options,answer,subject,topic,tags
  const docs = [];
  for (const r of rows) {
    const pick = (k) => r[k] ?? r[k?.toUpperCase?.()] ?? r[k?.toLowerCase?.()];
    const text = pick('text')?.toString().trim();
    if (!text) continue;
    const type = (pick('type')?.toString().trim().toLowerCase()) || 'mcq';
    const subject = pick('subject')?.toString().trim() || '';
    const topic = pick('topic')?.toString().trim() || '';
    const tags = (pick('tags')?.toString().split(/[,;]+/) || []).map((t) => t.trim()).filter(Boolean);
    let options = [];
    const answer = pick('answer');
    if (type === 'short') {
      options = [];
    } else {
      options = (pick('options')?.toString().split(/\s*\|\s*|\s*,\s*/g) || [])
        .map((t) => ({ text: t.trim() }))
        .filter((o) => o.text);
      if (answer != null && answer !== '') {
        const aStr = answer.toString();
        const parts = aStr.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
        if (parts.every((s) => /^\d+$/.test(s))) {
          const idxs = parts.map((s) => parseInt(s, 10));
          options = options.map((o, i) => ({ ...o, isCorrect: idxs.includes(i) }));
        } else {
          const texts = parts.map((s) => s.toLowerCase());
          options = options.map((o) => ({ ...o, isCorrect: texts.includes(o.text.toLowerCase()) }));
        }
      } else if (options.length > 0) {
        options[0].isCorrect = true;
      }
    }
    docs.push({ text, type, options, subject, topic, tags, createdBy: req.user.id });
  }
  if (!docs.length) return res.status(400).json({ message: 'No valid rows found' });
  const inserted = await Question.insertMany(docs);
  res.json({ uploaded: inserted.length });
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
