# SUDOKU ONLINE

## Full-Stack Coding Guide for Beginners

**Windows · Node.js · Express · PostgreSQL · Redis · Socket.IO · React**

---

## What We're Building — Road Map

| Phase   | What you build                                                   |
| ------- | ---------------------------------------------------------------- |
| Phase 1 | Project scaffold — folders, Git, environment variables           |
| Phase 2 | Database — PostgreSQL install, Prisma ORM, schema, migrations    |
| Phase 3 | Express server — app.js, middleware, error handler, health check |
| Phase 4 | Auth API — register, login, JWT, refresh tokens, logout          |
| Phase 5 | Puzzle & Game API — generate puzzle, save moves, resume game     |
| Phase 6 | Leaderboard API — submit score, Redis cache, top 100             |
| Phase 7 | Multiplayer — Socket.IO rooms, live progress, chat               |
| Phase 8 | Frontend integration — connect React to the API                  |
| Phase 9 | Docker & deployment — containerise, push to cloud                |

> 💡 **How to use this guide**
> Follow each phase in order. Every phase ends with a test command so you know it works before moving on. Never skip a phase — each one builds on the last.

---

# PHASE 1 — Project Scaffold

Create folders, initialise Git, install base packages, set up environment variables.

## 1.1 Open a Terminal in VS Code

In VS Code press `Ctrl + `` (backtick) to open the integrated terminal. All commands in this guide are typed here.

## 1.2 Create the Project Folder

```bash
cd C:\Users\YourName\Desktop
mkdir sudoku-app
cd sudoku-app
mkdir frontend backend
git init
```

## 1.3 Set Up the Backend

```bash
cd backend
npm init -y

npm install express cors helmet morgan cookie-parser express-rate-limit
npm install bcryptjs jsonwebtoken prisma @prisma/client
npm install redis socket.io passport passport-google-oauth20 passport-github2
npm install nodemailer express-validator dotenv

npm install -D nodemon jest supertest
```

### What these packages do

* `express` = web server
* `cors` = allow frontend to call API
* `helmet` = security headers
* `bcryptjs` = hash passwords
* `jsonwebtoken` = JWT tokens
* `prisma` = database ORM
* `redis` = cache
* `socket.io` = real-time multiplayer
* `nodemon` = auto-restart during development

## 1.4 Folder Structure

```bash
mkdir src
mkdir src\config
mkdir src\controllers
mkdir src\middlewares
mkdir src\routes
mkdir src\services
mkdir src\sockets
mkdir src\utils
mkdir src\validators
mkdir tests
```

## 1.5 Create `.env`

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sudoku_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_this_with_a_different_secret
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d
```

## 1.6 Create `.gitignore`

```gitignore
node_modules/
.env
dist/
*.log
```

## 1.7 Add Scripts

```json
"scripts": {
  "dev": "nodemon src/app.js",
  "start": "node src/app.js",
  "test": "jest --runInBand"
}
```

## 1.8 Phase 1 Checkpoint

```bash
node -v
ls node_modules
```

---

# PHASE 2 — Database Setup

Install PostgreSQL, create database, define schema with Prisma, run migrations.

## 2.1 Install PostgreSQL

* Download from PostgreSQL official website
* Keep default port: `5432`
* Remember your postgres password

## 2.2 Create Database

```sql
psql -U postgres
CREATE DATABASE sudoku_db;
\l
\q
```

## 2.3 Initialise Prisma

```bash
npx prisma init
```

## 2.4 Define Schema

Replace `schema.prisma` with your full schema.

## 2.5 Run Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 2.6 DB Config

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```

## 2.7 Redis Config

```javascript
const { createClient } = require('redis');
const redis = createClient({ url: process.env.REDIS_URL });
module.exports = { redis };
```

## 2.8 Phase 2 Checkpoint

```bash
npx prisma studio
```

---

# PHASE 3 — Express Server

Build app entry point, middleware, error handler, and health route.

## 3.1 Create `app.js`

Includes:

* Express app
* Helmet
* CORS
* Morgan
* Cookie parser
* Health check route
* Route registration
* Error handler
* Socket.IO init

## 3.2 Error Middleware

```javascript
function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong'
    }
  });
}
```

## 3.3 Async Wrapper

Used to avoid repeated try/catch.

## 3.4 AppError Utility

Custom error class with status code support.

## 3.5 Socket Stub

Create temporary socket file.

## 3.6 Stub Route Files

Create:

* auth.routes.js
* puzzle.routes.js
* game.routes.js
* leaderboard.routes.js
* room.routes.js

## 3.7 Phase 3 Checkpoint

```bash
npm run dev
```

Visit:

```text
http://localhost:4000/health
```

---

# PHASE 4 — Authentication API

Register, login, JWT, refresh token, logout.

## Includes

* bcrypt password hashing
* JWT access token
* Refresh token cookie
* Protected routes using middleware

## Routes

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

## Phase 4 Checkpoint

Test using:

```bash
curl
```

or

```text
Postman
```

---

# PHASE 5 — Puzzle & Game API

Generate Sudoku puzzles, save moves, resume progress.

## Includes

* Sudoku generator utility
* Puzzle creation
* Game save/resume
* Completion validation
* History tracking

## Routes

```text
GET    /api/games/new
GET    /api/games/active/:difficulty
PUT    /api/games/:id/move
POST   /api/games/:id/complete
GET    /api/games/history
```

---

# PHASE 6 — Leaderboard API

Top scores, Redis caching, personal rank.

## Includes

* Weekly leaderboard
* All-time leaderboard
* Redis cache
* Rank calculation

## Route

```text
GET /api/leaderboard
```

---

# PHASE 7 — Multiplayer (Socket.IO)

Real-time rooms, progress updates, winner detection, chat.

## Includes

* Create room
* Join room
* Start room
* Live progress updates
* Winner broadcast
* Room chat

## Socket Events

```text
room:join
game:progress
game:complete
room:chat
room:winner
```

---

# PHASE 8 — Frontend Integration

Connect React frontend with Express backend.

## Includes

* Vite + React
* Axios setup
* JWT auto refresh
* Socket.IO client
* Game API integration

## Install

```bash
npm create vite@latest . -- --template react
npm install
npm install axios socket.io-client react-router-dom
```

---

# PHASE 9 — Docker & Deployment

Containerise everything and run with one command.

## Includes

* Backend Dockerfile
* Docker Compose
* PostgreSQL container
* Redis container
* Frontend container

## Run

```bash
docker-compose up --build
```

## Stop

```bash
docker-compose down
```

---

# Quick Reference — Commands

| Command                         | What it does                   |
| ------------------------------- | ------------------------------ |
| npm run dev                     | Start backend with auto-reload |
| npx prisma migrate dev --name x | Create DB migration            |
| npx prisma generate             | Re-generate Prisma client      |
| npx prisma studio               | Open DB browser                |
| npx prisma migrate reset        | Reset DB                       |
| docker-compose up --build       | Build and start all services   |
| docker-compose down             | Stop services                  |
| npm test                        | Run tests                      |

---

# Common Mistakes & Fixes

| Error                          | Fix                              |
| ------------------------------ | -------------------------------- |
| ECONNREFUSED 5432              | PostgreSQL is not running        |
| ECONNREFUSED 6379              | Redis is not running             |
| Cannot find module             | Run npm install again            |
| JWT malformed                  | Login again for fresh token      |
| P2002 Unique constraint failed | Email or username already exists |
| prisma: command not found      | Use `npx prisma`                 |
| CORS error                     | Check `FRONTEND_URL` in `.env`   |

---

# You're Done 🚀

## What to Build Next

* Email verification (Nodemailer)
* Google OAuth
* Rate limiting per user
* Admin dashboard
* Mobile PWA
* Deploy to Railway / Render / AWS
