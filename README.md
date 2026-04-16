# UserHub — User Management System

A full-stack MERN application implementing secure user authentication, role-based access control (RBAC), and complete user lifecycle management.

## Demo Credentials

| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@example.com       | Admin@123    |
| Manager | manager@example.com     | Manager@123  |
| User    | user@example.com        | User@123     |

---

## Features

- **JWT Authentication** — Access token (15 min) + Refresh token (7 days, HTTP-only cookie)
- **RBAC** — Admin / Manager / User with enforced permissions on every route
- **User Management** — Create, read, update, soft-delete/deactivate users
- **Audit Trail** — `createdBy`, `updatedBy`, `createdAt`, `updatedAt` on every record
- **Search & Filter** — Paginated user list with name/email search, role & status filters
- **Security** — Helmet, CORS, bcrypt, rate limiting, input validation, no password in responses
- **Winston Logger** — Structured logs to console + files (error.log, combined.log)

---

## Tech Stack

| Layer     | Tech                                     |
|-----------|------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| Backend   | Node.js, Express, Mongoose               |
| Database  | MongoDB                                  |
| Auth      | JWT (jsonwebtoken), bcryptjs             |
| Logging   | Winston, Morgan                          |

---

## Project Structure

```
ums/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection, Winston logger
│   │   ├── constants/     # Roles, statuses, permission map
│   │   ├── controllers/   # Route handlers (thin layer)
│   │   ├── middleware/    # auth, rbac, validate, errorHandler
│   │   ├── models/        # Mongoose User model
│   │   ├── routes/        # Express routers
│   │   ├── services/      # Business logic
│   │   └── utils/         # ApiError, ApiResponse, asyncHandler
│   ├── scripts/seed.js    # One-shot DB seeder
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/           # Axios instance + interceptors + API calls
│       ├── components/    # Reusable UI components
│       ├── context/       # Auth context + provider
│       ├── pages/         # Route-level page components
│       └── utils/         # Permission helpers
├── docker-compose.yml
└── README.md
```

---

## Local Development

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas URI)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT secrets
npm install
npm run dev           # Starts on http://localhost:5000
# Optional: seed sample users
npm run seed
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev           # Starts on http://localhost:5173
```

---

## Deployment

### Backend — Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Set environment variables in the Render dashboard:

```
NODE_ENV=production
MONGO_URI=<your Atlas connection string>
JWT_ACCESS_SECRET=<strong random string>
JWT_REFRESH_SECRET=<different strong random string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_ORIGIN=<your Vercel frontend URL>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

### Frontend — Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Framework Preset: **Vite**
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment variable:

```
VITE_API_URL=https://<your-render-backend>.onrender.com/api
```

---

## API Reference

### Auth

| Method | Endpoint           | Access  | Description           |
|--------|--------------------|---------|-----------------------|
| POST   | /api/auth/login    | Public  | Login, get tokens     |
| POST   | /api/auth/refresh  | Cookie  | Refresh access token  |
| POST   | /api/auth/logout   | Auth    | Clear refresh token   |
| GET    | /api/auth/me       | Auth    | Current user info     |

### Users

| Method | Endpoint                 | Access           | Description          |
|--------|--------------------------|------------------|----------------------|
| GET    | /api/users               | Admin, Manager   | List with pagination |
| GET    | /api/users/stats         | Admin, Manager   | Dashboard stats      |
| POST   | /api/users               | Admin            | Create user          |
| GET    | /api/users/:id           | Auth (own/all)   | Get user by ID       |
| PUT    | /api/users/:id           | Auth (own/all)   | Update user          |
| DELETE | /api/users/:id           | Admin            | Delete user          |
| PATCH  | /api/users/:id/status    | Admin            | Toggle active status |

---

## Docker (optional)

```bash
# Copy env files first
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker-compose up --build
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Description                        | Default         |
|--------------------|------------------------------------|-----------------|
| PORT               | Server port                        | 5000            |
| NODE_ENV           | Environment                        | development     |
| MONGO_URI          | MongoDB connection string          | —               |
| JWT_ACCESS_SECRET  | Secret for access tokens           | —               |
| JWT_REFRESH_SECRET | Secret for refresh tokens          | —               |
| JWT_ACCESS_EXPIRY  | Access token expiry                | 15m             |
| JWT_REFRESH_EXPIRY | Refresh token expiry               | 7d              |
| CLIENT_ORIGIN      | Allowed CORS origin                | http://localhost:5173 |
| ADMIN_EMAIL        | Auto-seeded admin email            | admin@example.com |
| ADMIN_PASSWORD     | Auto-seeded admin password         | Admin@123       |

### Frontend (`frontend/.env`)

| Variable       | Description           |
|----------------|-----------------------|
| VITE_API_URL   | Backend API base URL  |
"# purple-merit-assignment" 
