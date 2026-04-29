# Product Requirements Document (PRD)

## Sudoku Web Application — Full Stack

**Version:** 1.0
**Year:** 2026

| Field            | Details                                                    |
| ---------------- | ---------------------------------------------------------- |
| **Product Name** | Sudoku Online                                              |
| **Version**      | 1.0.0                                                      |
| **Date**         | April 2026                                                 |
| **Author**       | Product Team                                               |
| **Tech Stack**   | React · Node.js · Express · PostgreSQL · Socket.IO · Redis |
| **Status**       | Draft — Pending Engineering Review                         |

---

## 1. Executive Summary

Sudoku Online is a full-stack web application that delivers a polished, browser-based Sudoku experience with persistent user accounts, a global leaderboard, the ability to save and resume games across sessions, and real-time multiplayer rooms for competitive or collaborative play.

The product targets casual puzzle enthusiasts and competitive players who want a seamless, fast, and socially connected Sudoku experience — accessible on any device without installing an app.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

* Acquire 10,000 registered users within 6 months of launch
* Achieve a 30-day retention rate of 25%+
* Maintain a 4.5+ star average rating in app stores and feedback surveys
* Zero critical security incidents in first year

### 2.2 Key Metrics (KPIs)

| Metric                        | Target                 |
| ----------------------------- | ---------------------- |
| Daily Active Users (DAU)      | 2,000+ within 3 months |
| Average session length        | >8 minutes             |
| Games completed per user/week | >5                     |
| Multiplayer room usage        | >20% of active users   |
| API uptime                    | 99.9%                  |
| P95 API response time         | <200ms                 |

---

## 3. User Personas

## 3.1 Persona A — The Casual Player

| Field           | Details                                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| **Name**        | Priya, 28 — Software Engineer, plays during commute                               |
| **Goals**       | Quick, satisfying puzzle sessions; track personal bests; resume games on the go   |
| **Pain Points** | Losing progress when browser closes; no visual feedback on mistakes; slow loading |

## 3.2 Persona B — The Competitor

| Field           | Details                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| **Name**        | Rajan, 35 — Data Analyst, wants to rank on leaderboards                                  |
| **Goals**       | Compete globally; challenge friends in multiplayer rooms; track win rate by difficulty   |
| **Pain Points** | Leaderboards that feel fake or uncompetitive; lag in multiplayer; no ranking tier system |

---

## 4. Features & Requirements

## 4.1 User Authentication

* Email/password registration with email verification
* OAuth login via Google and GitHub
* JWT-based session management with refresh tokens
* Profile page: avatar, username, stats summary
* Password reset via email

## 4.2 Core Gameplay

* Puzzle generation for Easy / Medium / Hard difficulty levels
* 9x9 interactive grid with conflict highlighting
* Note mode (pencil candidates) per cell
* Hint system (up to 3 per game)
* Erase / undo / redo support
* Timer with pause capability
* Mistake counter (visible, optional setting to limit mistakes)
* Auto-save board state every 10 seconds

## 4.3 Save & Resume

* Active game state persisted to database on each move
* Resume from any device after login
* Game history: list of completed and abandoned games with stats
* Multiple concurrent saves (one per difficulty)

## 4.4 Leaderboard

* Global leaderboard: fastest solve times by difficulty
* Weekly and all-time filters
* Personal rank badge displayed on profile
* Top 100 visible to all; personal rank always shown
* Anti-cheat: server-side puzzle validation, time anomaly detection

## 4.5 Multiplayer

* Create a room (public or private with code)
* Up to 4 players per room, each solving the same puzzle simultaneously
* Live progress indicators: see opponents' % completion
* Room chat (text, no voice in v1)
* Winner announced when first player completes puzzle
* Spectator mode for rooms already in progress

## 4.6 Settings & Accessibility

* Dark / light / sepia themes
* High-contrast mode for accessibility
* Keyboard-only navigation support
* Sound effects toggle
* Timer hide option

---

## 5. Out of Scope (v1)

* Mobile native apps (iOS / Android)
* Voice chat in multiplayer
* Puzzle editor / custom puzzles
* Paid subscriptions or in-app purchases
* Offline PWA support

---

## 6. Release Plan

| Milestone        | Description                                      | Target Date |
| ---------------- | ------------------------------------------------ | ----------- |
| M1 — Core Game   | Puzzle engine, grid UI, difficulty, notes, timer | Week 3      |
| M2 — Auth        | Registration, login, OAuth, JWT, profile         | Week 5      |
| M3 — Save/Resume | Auto-save, game history, cross-device resume     | Week 7      |
| M4 — Leaderboard | Score submission, ranking, anti-cheat            | Week 9      |
| M5 — Multiplayer | Rooms, Socket.IO, live progress, chat            | Week 13     |
| M6 — Polish      | Accessibility, themes, perf tuning, beta testing | Week 16     |
| v1.0 Launch      | Production deploy, monitoring, marketing         | Week 18     |

---

## 7. Risks & Mitigations

| Risk                                  | Mitigation                                                              |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Multiplayer latency causing bad UX    | Use Redis pub/sub + Socket.IO with reconnection logic; test under load  |
| Puzzle duplication or trivial puzzles | Server-side difficulty verification; seed database with curated puzzles |
| Cheating on leaderboard               | Server validates full solve; flag sub-30s completes for review          |
| JWT token theft / XSS                 | HttpOnly cookies, CSP headers, rate limiting on auth endpoints          |
| Database performance at scale         | PostgreSQL + Redis caching; paginate leaderboard queries                |

---

## 8. Appendix — Glossary

| Term        | Definition                                                                             |
| ----------- | -------------------------------------------------------------------------------------- |
| JWT         | JSON Web Token — stateless auth token signed with server secret                        |
| Socket.IO   | WebSocket abstraction library for real-time bi-directional communication               |
| Redis       | In-memory data store used for caching and pub/sub messaging                            |
| Puzzle seed | Deterministic initial state used to generate the same puzzle for all players in a room |
| Candidate   | Possible number noted in a cell (pencil mark), not confirmed                           |