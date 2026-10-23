-- Prime AI/ML Course Tracker - SQLite Relational Schema
-- Database: tracker.db

-- 1. Completed Lessons Table
CREATE TABLE IF NOT EXISTS completed_lessons (
    item_id TEXT PRIMARY KEY,
    day_id TEXT NOT NULL,
    completed_at TEXT NOT NULL
);

-- 2. Starred Revision Lessons Table
CREATE TABLE IF NOT EXISTS starred_lessons (
    item_id TEXT PRIMARY KEY,
    day_id TEXT NOT NULL,
    starred_at TEXT NOT NULL
);

-- 3. Personal Study Notes Table
CREATE TABLE IF NOT EXISTS notes (
    note_key TEXT PRIMARY KEY,
    content TEXT,
    updated_at TEXT NOT NULL
);

-- 4. Pomodoro Focus Sessions Log
CREATE TABLE IF NOT EXISTS pomodoro_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_date TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    day_id TEXT,
    timestamp TEXT NOT NULL
);

-- 5. Playback History & Resume Positions
CREATE TABLE IF NOT EXISTS playback_positions (
    item_id TEXT PRIMARY KEY,
    current_time REAL NOT NULL,
    duration REAL NOT NULL,
    updated_at TEXT NOT NULL
);

-- 6. User Settings & Target Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 7. Daily Activity Aggregates
CREATE TABLE IF NOT EXISTS daily_activity (
    activity_date TEXT PRIMARY KEY,
    items_completed INTEGER DEFAULT 0,
    focus_minutes INTEGER DEFAULT 0
);

-- Indices for rapid query lookup
CREATE INDEX IF NOT EXISTS idx_completed_day ON completed_lessons(day_id);
CREATE INDEX IF NOT EXISTS idx_starred_day ON starred_lessons(day_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_date ON pomodoro_logs(session_date);
