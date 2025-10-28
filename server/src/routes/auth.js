import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// TEMP: register admin (lock behind env in real deployment)
router.post('/register-admin', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    let user = await User.findOne({ email });
    if (user) return res.status(409).json({ message: 'User exists' });
    user = new User({ email, name, role: 'admin' });
    await user.setPassword(password);
    await user.save();
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, examId } = req.body;
    const query = email ? { email } : { examId };
    const user = await User.findOne(query);
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = email ? await user.validatePassword(password) : true; // allow examId-only if configured later
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset (dev: returns token in response; prod: email it)
router.post('/reset-request', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ ok: true }); // don't reveal
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30m
  await PasswordResetToken.create({ user: user._id, token, expiresAt });
  return res.json({ ok: true, token });
});

// Confirm password reset
router.post('/reset-confirm', async (req, res) => {
  const { token, password } = req.body;
  const rec = await PasswordResetToken.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
  if (!rec) return res.status(400).json({ message: 'Invalid or expired token' });
  const user = await User.findById(rec.user);
  if (!user) return res.status(400).json({ message: 'Invalid token' });
  await user.setPassword(password);
  await user.save();
  rec.used = true;
  await rec.save();
  res.json({ ok: true });
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json({ user });
});

export default router;
