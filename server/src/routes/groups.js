import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

const router = Router();

// Create group
router.post('/', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const { code, name, description } = req.body;
  if (!code || !name) return res.status(400).json({ message: 'code and name required' });
  const item = await Group.create({ code: code.trim(), name: name.trim(), description });
  res.status(201).json(item);
});

// List groups
router.get('/', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const items = await Group.find().sort({ createdAt: -1 });
  res.json(items);
});

// Add members by email list
router.post('/:code/members', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const { code } = req.params;
  const { emails = [] } = req.body; // array of emails
  if (!Array.isArray(emails) || emails.length === 0) return res.status(400).json({ message: 'emails array required' });
  const users = await User.find({ email: { $in: emails } });
  const emailSet = new Set(users.map((u) => u.email));
  for (const u of users) {
    const set = new Set(u.groups || []);
    set.add(code);
    u.groups = Array.from(set);
    await u.save();
  }
  const missing = emails.filter((e) => !emailSet.has(e));
  res.json({ added: users.length, missing });
});

// Remove members by email list
router.delete('/:code/members', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const { code } = req.params;
  const { emails = [] } = req.body;
  if (!Array.isArray(emails) || emails.length === 0) return res.status(400).json({ message: 'emails array required' });
  const users = await User.find({ email: { $in: emails } });
  for (const u of users) {
    u.groups = (u.groups || []).filter((g) => g !== code);
    await u.save();
  }
  res.json({ removed: users.length });
});

// List members
router.get('/:code/members', auth, requireRole('admin', 'instructor'), async (req, res) => {
  const { code } = req.params;
  const users = await User.find({ groups: code }).select('name email groups');
  res.json(users);
});

export default router;
