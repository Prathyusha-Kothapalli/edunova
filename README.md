# 🎓 EduNova — Enterprise Online Learning Platform

EduNova is a production-quality, modular, and scalable **Online Learning Platform** built with **JavaScript (ES6+), HTML5, CSS3, Node.js / Express, and SQLite**. Designed for enterprise-grade performance and a portfolio project experience, it supports **Student, Instructor, and Admin RBAC roles**, interactive custom video player, timed quiz assessments, automated grading, verifiable digital certificates, and dark/light appearance modes.

---

## 🌟 Key Features

- **🔐 Multi-Role Authentication & RBAC**: Dedicated Student, Instructor, and Admin views with secure JWT authentication and route authorization.
- **📚 Rich Course Catalog**: Searchable and filterable grid across 26 courses (categories, difficulty levels, sorting by popularity, rating, price).
- **📹 Interactive Video Player**: HTML5 player with playback speed controls (0.5x–2x), lesson progress auto-tracking, note-taking, and resource downloads.
- **⏱️ Timed Quiz Engine**: Multiple-choice assessments with countdown timer, instant automated scoring, pass/fail status, and detailed explanation breakdowns.
- **📜 Verifiable Digital Certificates**: Dynamic HTML & printable certificate generator unlocked upon 100% course completion.
- **📊 Role Dashboards**:
  - **Student Dashboard**: Enrolled courses, overall progress bars, certificate library, learning streak tracking.
  - **Instructor Studio**: Course creation wizard (modules, lessons, pricing), student enrollment metrics, revenue analytics.
  - **Admin Control Panel**: User moderation (suspend/activate, role assignment), course management, platform metrics, and audit log trail.
- **🌙 Dark & Light Themes**: Persistent appearance mode toggle with glassmorphism UI design tokens.
- **⚡ 1-Click Demo Login Bar**: Instant role switching for effortless demonstration.

---

## 🔑 Demo Account Credentials

Use the **1-Click Quick Demo Login** buttons on the top navbar / login screen or enter credentials manually:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Student** | `student@edunova.com` | `Demo@123` | Course enrollment, video player, quizzes, certificates |
| **Instructor** | `instructor@edunova.com` | `Demo@123` | Course creation wizard, student grading, earnings analytics |
| **Admin** | `admin@edunova.com` | `Demo@123` | User moderation, role assignment, system stats, audit logs |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `3.10+` (for analytics and platform validator scripts)

### Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Seed database (26 courses, 208 lessons, 52 quizzes, 100 students)
npm run seed

# 3. Start local development server
npm run dev
# Or
npm start
```

Access the application in your browser at: **`http://localhost:3000`**

---

## 🧪 Automated Testing & Validation

EduNova includes **17 unit and integration tests** across 5 test suites:

```bash
# Run all automated test suites
npm test

# Run Python platform integrity validator
python scripts/validate_platform.py

# Export platform analytics summary to CSV
python scripts/analytics_exporter.py
```

### Automated Test Coverage
1. `tests/auth.test.js` — Registration, JWT login, demo logins, invalid credentials rejection.
2. `tests/courses.test.js` — Course catalog listing, search, category filtering, course details retrieval.
3. `tests/quizzes.test.js` — Quiz question fetching, answer evaluation, automated score calculation.
4. `tests/progress.test.js` — Lesson completion toggling, progress % recalculation, auto certificate issuance.
5. `tests/admin.test.js` — Admin permissions check, user status suspend/activate, audit log tracking.

---

## 🐳 Docker & Automation

```bash
# Build and run with Docker Compose
make docker-up

# Stop Docker containers
make docker-down
```

### Makefile Commands

| Command | Action |
|---|---|
| `make install` | Install npm packages |
| `make seed` | Seed database with 25+ courses and 100 students |
| `make dev` | Start development server with auto-reload |
| `make test` | Execute 5 test suites |
| `make validate` | Run Python platform integrity check |
| `make analytics` | Export analytics CSV report |

---

## 🛠️ 5-Phase Development & Git Commit Roadmap

The codebase is organized into 5 structured feature phases suitable for Git commits and Pull Requests:

1. **Phase 1: Core Infrastructure & Auth API**
   - Express server architecture, SQLite schema definition, JWT authentication, auto-seeder script.
2. **Phase 2: Course Catalog & Video Classroom**
   - Catalog search/filter APIs, course detail views, custom HTML5 video player component.
3. **Phase 3: Quiz Assessment & Certificate Generator**
   - Timed quiz runner engine, automated scoring, progress tracking, dynamic HTML certificate renderer.
4. **Phase 4: Role Dashboards & Admin Moderation**
   - Student dashboard, Instructor course creation wizard, Admin user moderation & audit logs.
5. **Phase 5: Testing, DevOps & Analytics Utilities**
   - 5 test suites, Docker containerization, Makefile, Python validation and analytics exporter scripts.

---

## 📄 License
Released under the [MIT License](LICENSE).
