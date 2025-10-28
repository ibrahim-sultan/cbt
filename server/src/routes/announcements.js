import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Announcement from '../models/Announcement.js';

const router = Router();

// Create
router.post('/', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const { title, body, audience = 'all' } = req.body;
  const item = await Announcement.create({ title, body, audience, createdBy: req.user.id });
  res.status(201).json(item);
});

// List
router.get('/', auth, async (req, res) => {
  // Students get 'all'; admins see all
  const role = req.user?.role;
  const filter = role === 'admin' || role === 'instructor' ? {} : { audience: 'all' };
  const items = await Announcement.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(items);
});

// Delete
router.delete('/:id', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const r = await Announcement.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

export default router;
