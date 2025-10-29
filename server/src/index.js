import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import questionRoutes from './routes/questions.js';
import monitorRoutes from './routes/monitor.js';
import announcementRoutes from './routes/announcements.js';
import groupRoutes from './routes/groups.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL?.split(',') || true), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/groups', groupRoutes);

const PORT = process.env.PORT || 4000;

// Serve client build for SPA in production/runtime if we can find it
{
  const candidates = [];
  if (process.env.CLIENT_DIST_DIR) {
    candidates.push(
      process.env.CLIENT_DIST_DIR,
      path.resolve(process.cwd(), process.env.CLIENT_DIST_DIR),
      path.resolve(process.cwd(), '..', process.env.CLIENT_DIST_DIR),
      path.resolve(process.cwd(), '../../', process.env.CLIENT_DIST_DIR)
    );
  }
  // Common fallbacks for monorepos (root -> client/dist, server -> ../client/dist)
  candidates.push(
    path.resolve(process.cwd(), 'client/dist'),
    path.resolve(process.cwd(), '../client/dist'),
    path.resolve(process.cwd(), '../../client/dist')
  );
  const clientDist = candidates.find((p) => {
    try { return fs.existsSync(path.join(p, 'index.html')); } catch { return false; }
  });
  console.log('Static client directory resolved to:', clientDist || '(not found)');
  if (clientDist) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }
}

if (process.env.NODE_ENV !== 'test') {
  const start = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
      console.error('DB connection failed:', err.message);
      process.exit(1);
    }
  };
  start();
}

export default app;
