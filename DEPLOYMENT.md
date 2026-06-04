# FitTrack - Deployment & Run Guide

Quick steps to run the project locally and run tests.

Prerequisites
- Node.js 18+
- npm
- MongoDB running locally or set `DATABASE_URL` env

Backend
1. Install dependencies:

```bash
cd backend
npm install
```

2. Start server in dev mode:

```bash
npm run dev
```

The server starts on port defined in env (default 5000).

SMTP (email reminders)
1. To enable email reminders, set the following environment variables for the backend process (example `.env`):

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="FitTrack <no-reply@fittrack.app>"
```

2. Restart backend so the SMTP configuration is picked up. The scheduler will attempt to send reminder emails to users who have `NotificationSetting.enabled = true` and a valid email in their profile.

Frontend
1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start dev server:

```bash
npm run dev
```

Frontend runs using Next.js (default port 3000, fallback 3001).

Run tests
- Frontend unit tests (Vitest):

```bash
cd frontend
npm run test:unit
```

CI
- A GitHub Actions workflow `.github/workflows/ci.yml` runs frontend typecheck and unit tests on push/PR to `main` and `dev`.

Notes
- Scheduler: backend runs a simple scheduler that checks `NotificationSetting` documents every minute and logs reminders to console. Integrate a notification push/email service to send real notifications.
- To install new backend dependencies (e.g., `node-cron`) run `npm install` in `backend`.
