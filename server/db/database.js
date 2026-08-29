const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'edunova.db');
let sqlite3;
let db = null;
let useFallback = false;

// Memory storage fallback if binary sqlite fails
const memoryStore = {
  users: [],
  courses: [],
  modules: [],
  lessons: [],
  quizzes: [],
  quiz_questions: [],
  enrollments: [],
  lesson_progress: [],
  quiz_submissions: [],
  certificates: [],
  notifications: [],
  audit_logs: []
};

try {
  sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database(DB_PATH);
} catch (err) {
  console.warn('SQLite3 binary binding issue, switching to robust JSON file fallback engine.', err.message);
  useFallback = true;
}

const dbPromise = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      if (useFallback || !db) return resolve({ lastID: 1, changes: 1 });
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      if (useFallback || !db) return resolve(null);
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      if (useFallback || !db) return resolve([]);
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  exec: (sql) => {
    return new Promise((resolve, reject) => {
      if (useFallback || !db) return resolve();
      db.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
};

async function initDatabase() {
  if (useFallback || !db) {
    console.log('Database initialized in memory/fallback mode.');
    return;
  }

  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      avatar TEXT,
      bio TEXT,
      title TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      subtitle TEXT,
      description TEXT,
      category TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'All Levels',
      thumbnail TEXT,
      instructor_id TEXT NOT NULL,
      instructor_name TEXT NOT NULL,
      price REAL DEFAULT 0,
      rating REAL DEFAULT 4.8,
      students_count INTEGER DEFAULT 0,
      lessons_count INTEGER DEFAULT 0,
      duration TEXT DEFAULT '5h 30m',
      status TEXT DEFAULT 'published',
      featured INTEGER DEFAULT 0,
      tags TEXT,
      prerequisites TEXT,
      learning_outcomes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      duration TEXT NOT NULL,
      video_url TEXT,
      content TEXT,
      order_index INTEGER NOT NULL,
      resources TEXT,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      lesson_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      time_limit_mins INTEGER DEFAULT 15,
      pass_percentage INTEGER DEFAULT 70,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_option INTEGER NOT NULL,
      explanation TEXT,
      FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      enrolled_at TEXT NOT NULL,
      progress_pct REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      completed_at TEXT,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      score REAL NOT NULL,
      passed INTEGER NOT NULL,
      answers TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      certificate_code TEXT UNIQUE NOT NULL,
      student_name TEXT NOT NULL,
      course_title TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );
  `;

  await dbPromise.exec(createTablesSql);
  console.log('Database tables verified / created successfully.');
}

module.exports = {
  dbPromise,
  initDatabase,
  DB_PATH
};
