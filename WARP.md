# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands
- Install all deps: `npm run install:all`
- Dev (client + server): `npm run dev`
- Client only: `npm --prefix client run dev`
- Server only: `npm --prefix server run dev`
- Lint: `npm run lint`
- Build client: `npm --prefix client run build`
- Run tests:
  - All: `npm run test`
  - Client only: `npm run test:client`
  - Server only: `npm run test:server`
  - Single test (pattern):
    - Client: `npm --prefix client run test -- -t "<pattern>"`
    - Server: `npm --prefix server run test -- -t "<pattern>"`

## Environment
- Server `server/.env` (copy from `.env.example`):
  - `MONGO_URI=mongodb://localhost:27017/cbt`
  - `JWT_SECRET=change_me`
  - `PORT=4000`
  - `CLIENT_URL=http://localhost:5173`
- Client `client/.env` (optional):
  - `API_BASE_URL=http://localhost:4000/api`

## Architecture (big picture)
- Frontend (`client/`)
  - React (plain JS) bundled by webpack + Babel.
  - Entry: `src/index.jsx` -> `src/App.jsx`.
  - Dev server on 5173 with proxy to `/api` -> backend.
  - Custom CSS via `src/index.css` and CSS loader.
- Backend (`server/`)
  - Express app with modular routes: `auth`, `exams`, `questions` under `/api/*`.
  - MongoDB via Mongoose. Models: `User`, `Question`, `Exam`, `Attempt` (skeletons included).
  - JWT auth middleware with role-based guard (`auth`, `requireRole`).
  - Utilities for grading/randomization (placeholders in `src/utils/`).

## Notable behaviors
- Dev proxy: client dev server proxies `/api` to `http://localhost:4000`.
- Roles: `admin`, `instructor`, `student` (plus placeholders for `moderator`, `superadmin`).
- Tests: Jest in both client (jsdom) and server (node). Server uses Supertest for HTTP.

## Suggested flows
- First run: create `server/.env`, start MongoDB, then `npm run install:all` and `npm run dev`.
- Create an admin manually (temporary): POST `/api/auth/register-admin` then login via `/api/auth/login` to create exams/questions. Replace with proper onboarding later.
