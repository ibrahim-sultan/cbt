import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import questionRoutes from './routes/questions.js';
import monitorRoutes from './routes/monitor.js';
import announcementRoutes from './routes/announcements.js';
import groupRoutes from './routes/groups.js';

const app = express();
app.use(helmet());

// CORS: allow Netlify app and local dev
const allowedOrigins = [
  'https://cbtapplication.netlify.app',
  'http://localhost:3000'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/groups', groupRoutes);

// Serve frontend build (auto-detect dist dir)
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
  candidates.push(
    path.resolve(process.cwd(), 'client/dist'),
    path.resolve(process.cwd(), '../client/dist'),
    path.resolve(process.cwd(), '../../client/dist')
  );
  const clientDist = candidates.find((p) => {
    try { return fs.existsSync(path.join(p, 'index.html')); } catch { return false; }
  });
  if (clientDist) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }
}

export default app;
