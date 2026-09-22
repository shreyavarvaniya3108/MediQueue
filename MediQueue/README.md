# MediQueue

Clinic-based doctor appointment system with real-time waiting-time prediction.
Built with MongoDB, Express.js, React.js, Node.js (MERN) + Socket.io.

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in your MongoDB URI and JWT secret
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs on http://localhost:5173 and expects the backend on http://localhost:5000.

## Features
- Patient and Doctor signup/login (JWT + Bcrypt)
- Patient books an appointment request; Doctor can Accept / Reject / Delay it
- Live, auto-updating waiting time and queue position (Socket.io)
- Doctor dashboard with full patient details and past visit history
- Doctor can flag themselves as "running late" — all waiting patients get notified instantly
- Nightly cron job recalculates each doctor's average consultation time
- Patient can rate the doctor after a completed visit
