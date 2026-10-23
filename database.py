import sqlite3
import os
import json
from datetime import datetime, date

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "tracker.db")
LEGACY_JSON_PATH = os.path.join(BASE_DIR, "tracker_data.json")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Completed Lessons Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS completed_lessons (
            item_id TEXT PRIMARY KEY,
            day_id TEXT NOT NULL,
            completed_at TEXT NOT NULL
        )
    ''')

    # 2. Starred Revision Lessons Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS starred_lessons (
            item_id TEXT PRIMARY KEY,
            day_id TEXT NOT NULL,
            starred_at TEXT NOT NULL
        )
    ''')

    # 3. Personal Study Notes Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            note_key TEXT PRIMARY KEY,
            content TEXT,
            updated_at TEXT NOT NULL
        )
    ''')

    # 4. Pomodoro Focus Sessions Log
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pomodoro_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_date TEXT NOT NULL,
            minutes INTEGER NOT NULL,
            day_id TEXT,
            timestamp TEXT NOT NULL
        )
    ''')

    # 5. Playback History & Resume Positions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS playback_positions (
            item_id TEXT PRIMARY KEY,
            current_time REAL NOT NULL,
            duration REAL NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')

    # 6. User Settings & Target Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')

    # 7. Daily Activity Aggregates
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_activity (
            activity_date TEXT PRIMARY KEY,
            items_completed INTEGER DEFAULT 0,
            focus_minutes INTEGER DEFAULT 0
        )
    ''')

    conn.commit()

    # Check if migration from JSON is needed
    cursor.execute('SELECT COUNT(*) as count FROM completed_lessons')
    comp_count = cursor.fetchone()['count']
    cursor.execute('SELECT COUNT(*) as count FROM settings')
    settings_count = cursor.fetchone()['count']

    if comp_count == 0 and settings_count == 0 and os.path.exists(LEGACY_JSON_PATH):
        migrate_from_json(conn)

    conn.close()

def migrate_from_json(conn):
    try:
        with open(LEGACY_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        cursor = conn.cursor()

        # Migrate completed items
        completed = data.get('completed_items', {})
        for item_id, val in completed.items():
            completed_at = val.get('completed_at', datetime.now().isoformat()) if isinstance(val, dict) else datetime.now().isoformat()
            day_id = item_id.split('_')[0] if '_' in item_id else 'DAY 01'
            cursor.execute('INSERT OR REPLACE INTO completed_lessons (item_id, day_id, completed_at) VALUES (?, ?, ?)',
                           (item_id, day_id, completed_at))

        # Migrate starred
        starred = data.get('starred_items', {})
        for item_id in starred.keys():
            day_id = item_id.split('_')[0] if '_' in item_id else 'DAY 01'
            cursor.execute('INSERT OR REPLACE INTO starred_lessons (item_id, day_id, starred_at) VALUES (?, ?, ?)',
                           (item_id, day_id, datetime.now().isoformat()))

        # Migrate notes
        notes = data.get('notes', {})
        for key, val in notes.items():
            content = val.get('content', '') if isinstance(val, dict) else str(val)
            updated_at = val.get('updated_at', datetime.now().isoformat()) if isinstance(val, dict) else datetime.now().isoformat()
            cursor.execute('INSERT OR REPLACE INTO notes (note_key, content, updated_at) VALUES (?, ?, ?)',
                           (key, content, updated_at))

        # Migrate settings
        daily_target = data.get('daily_target', 5)
        cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ('daily_target', str(daily_target)))

        last_active = data.get('last_active', {'day_id': 'DAY 01'})
        cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ('last_active', json.dumps(last_active)))

        # Migrate study log
        study_log = data.get('study_log', {})
        for dt_str, stats in study_log.items():
            done = stats.get('items_completed', 0)
            mins = stats.get('minutes', 0)
            cursor.execute('INSERT OR REPLACE INTO daily_activity (activity_date, items_completed, focus_minutes) VALUES (?, ?, ?)',
                           (dt_str, done, mins))

        conn.commit()
        print(f"Successfully migrated legacy data to SQLite database: {DB_PATH}")
    except Exception as e:
        print("Migration warning:", e)

def get_progress():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Completed items dict
    cursor.execute('SELECT item_id, completed_at FROM completed_lessons')
    completed_items = {row['item_id']: {'completed': True, 'completed_at': row['completed_at']} for row in cursor.fetchall()}

    # Starred items dict
    cursor.execute('SELECT item_id FROM starred_lessons')
    starred_items = {row['item_id']: True for row in cursor.fetchall()}

    # Notes dict
    cursor.execute('SELECT note_key, content, updated_at FROM notes')
    notes = {row['note_key']: {'content': row['content'], 'updated_at': row['updated_at']} for row in cursor.fetchall()}

    # Settings
    cursor.execute('SELECT key, value FROM settings')
    settings_rows = {row['key']: row['value'] for row in cursor.fetchall()}
    daily_target = int(settings_rows.get('daily_target', 5))
    last_active = json.loads(settings_rows.get('last_active', '{"day_id": "DAY 01"}'))

    # Study Log
    cursor.execute('SELECT activity_date, items_completed, focus_minutes FROM daily_activity')
    study_log = {row['activity_date']: {'items_completed': row['items_completed'], 'minutes': row['focus_minutes']} for row in cursor.fetchall()}

    # Playback Positions
    cursor.execute('SELECT item_id, current_time, duration, updated_at FROM playback_positions')
    playback_positions = {row['item_id']: {'current_time': row['current_time'], 'duration': row['duration']} for row in cursor.fetchall()}

    # Pomodoro history
    cursor.execute('SELECT session_date, minutes, day_id, timestamp FROM pomodoro_logs ORDER BY id DESC LIMIT 100')
    pomodoro_history = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        "completed_items": completed_items,
        "starred_items": starred_items,
        "notes": notes,
        "daily_target": daily_target,
        "study_log": study_log,
        "playback_positions": playback_positions,
        "pomodoro_history": pomodoro_history,
        "last_active": last_active
    }

def toggle_item(item_id, is_completed):
    conn = get_db_connection()
    cursor = conn.cursor()
    today_str = date.today().isoformat()
    now_iso = datetime.now().isoformat()
    day_id = item_id.split('_')[0] if '_' in item_id else 'DAY 01'

    if is_completed:
        cursor.execute('INSERT OR REPLACE INTO completed_lessons (item_id, day_id, completed_at) VALUES (?, ?, ?)',
                       (item_id, day_id, now_iso))
        # Update daily activity
        cursor.execute('''
            INSERT INTO daily_activity (activity_date, items_completed, focus_minutes)
            VALUES (?, 1, 0)
            ON CONFLICT(activity_date) DO UPDATE SET items_completed = items_completed + 1
        ''', (today_str,))
    else:
        cursor.execute('DELETE FROM completed_lessons WHERE item_id = ?', (item_id,))
        cursor.execute('''
            UPDATE daily_activity 
            SET items_completed = MAX(0, items_completed - 1)
            WHERE activity_date = ?
        ''', (today_str,))

    conn.commit()

    # Get total completed count & today count
    cursor.execute('SELECT COUNT(*) as count FROM completed_lessons')
    total_completed = cursor.fetchone()['count']

    cursor.execute('SELECT items_completed, focus_minutes FROM daily_activity WHERE activity_date = ?', (today_str,))
    row = cursor.fetchone()
    today_log = {'items_completed': row['items_completed'], 'minutes': row['focus_minutes']} if row else {'items_completed': 0, 'minutes': 0}

    conn.close()
    return total_completed, today_log

def batch_day(day_id, items, mark_as):
    conn = get_db_connection()
    cursor = conn.cursor()
    today_str = date.today().isoformat()
    now_iso = datetime.now().isoformat()

    changed_count = 0
    for it in items:
        iid = it['id']
        if mark_as:
            cursor.execute('SELECT 1 FROM completed_lessons WHERE item_id = ?', (iid,))
            if not cursor.fetchone():
                cursor.execute('INSERT OR REPLACE INTO completed_lessons (item_id, day_id, completed_at) VALUES (?, ?, ?)',
                               (iid, day_id, now_iso))
                changed_count += 1
        else:
            cursor.execute('SELECT 1 FROM completed_lessons WHERE item_id = ?', (iid,))
            if cursor.fetchone():
                cursor.execute('DELETE FROM completed_lessons WHERE item_id = ?', (iid,))
                changed_count += 1

    if changed_count > 0:
        if mark_as:
            cursor.execute('''
                INSERT INTO daily_activity (activity_date, items_completed, focus_minutes)
                VALUES (?, ?, 0)
                ON CONFLICT(activity_date) DO UPDATE SET items_completed = items_completed + ?
            ''', (today_str, changed_count, changed_count))
        else:
            cursor.execute('''
                UPDATE daily_activity 
                SET items_completed = MAX(0, items_completed - ?)
                WHERE activity_date = ?
            ''', (changed_count, today_str))

    conn.commit()
    cursor.execute('SELECT COUNT(*) as count FROM completed_lessons')
    total_completed = cursor.fetchone()['count']
    conn.close()
    return total_completed

def toggle_star(item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    day_id = item_id.split('_')[0] if '_' in item_id else 'DAY 01'

    cursor.execute('SELECT 1 FROM starred_lessons WHERE item_id = ?', (item_id,))
    row = cursor.fetchone()

    if row:
        cursor.execute('DELETE FROM starred_lessons WHERE item_id = ?', (item_id,))
        new_state = False
    else:
        cursor.execute('INSERT INTO starred_lessons (item_id, day_id, starred_at) VALUES (?, ?, ?)',
                       (item_id, day_id, datetime.now().isoformat()))
        new_state = True

    conn.commit()
    conn.close()
    return new_state

def save_note(key, content):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    cursor.execute('INSERT OR REPLACE INTO notes (note_key, content, updated_at) VALUES (?, ?, ?)',
                   (key, content, now_iso))
    conn.commit()
    conn.close()

def save_playback(item_id, current_time, duration):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    cursor.execute('INSERT OR REPLACE INTO playback_positions (item_id, current_time, duration, updated_at) VALUES (?, ?, ?, ?)',
                   (item_id, float(current_time), float(duration), now_iso))
    conn.commit()
    conn.close()

def log_pomodoro(minutes, day_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    today_str = date.today().isoformat()
    now_iso = datetime.now().isoformat()

    cursor.execute('INSERT INTO pomodoro_logs (session_date, minutes, day_id, timestamp) VALUES (?, ?, ?, ?)',
                   (today_str, int(minutes), day_id, now_iso))

    cursor.execute('''
        INSERT INTO daily_activity (activity_date, items_completed, focus_minutes)
        VALUES (?, 0, ?)
        ON CONFLICT(activity_date) DO UPDATE SET focus_minutes = focus_minutes + ?
    ''', (today_str, int(minutes), int(minutes)))

    conn.commit()
    conn.close()

def set_setting(key, value):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (key, str(value)))
    conn.commit()
    conn.close()

def restore_backup(data):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear current tables
    cursor.execute('DELETE FROM completed_lessons')
    cursor.execute('DELETE FROM starred_lessons')
    cursor.execute('DELETE FROM notes')
    cursor.execute('DELETE FROM daily_activity')
    cursor.execute('DELETE FROM playback_positions')
    cursor.execute('DELETE FROM settings')

    # Completed
    for iid, val in data.get('completed_items', {}).items():
        comp_at = val.get('completed_at', datetime.now().isoformat()) if isinstance(val, dict) else datetime.now().isoformat()
        did = iid.split('_')[0] if '_' in iid else 'DAY 01'
        cursor.execute('INSERT INTO completed_lessons (item_id, day_id, completed_at) VALUES (?, ?, ?)', (iid, did, comp_at))

    # Starred
    for iid in data.get('starred_items', {}).keys():
        did = iid.split('_')[0] if '_' in iid else 'DAY 01'
        cursor.execute('INSERT INTO starred_lessons (item_id, day_id, starred_at) VALUES (?, ?, ?)', (iid, did, datetime.now().isoformat()))

    # Notes
    for k, val in data.get('notes', {}).items():
        content = val.get('content', '') if isinstance(val, dict) else str(val)
        up_at = val.get('updated_at', datetime.now().isoformat()) if isinstance(val, dict) else datetime.now().isoformat()
        cursor.execute('INSERT INTO notes (note_key, content, updated_at) VALUES (?, ?, ?)', (k, content, up_at))

    # Settings
    target = data.get('daily_target', 5)
    cursor.execute('INSERT INTO settings (key, value) VALUES (?, ?)', ('daily_target', str(target)))
    last_act = data.get('last_active', {'day_id': 'DAY 01'})
    cursor.execute('INSERT INTO settings (key, value) VALUES (?, ?)', ('last_active', json.dumps(last_act)))

    # Study Log
    for dt_str, stats in data.get('study_log', {}).items():
        cursor.execute('INSERT INTO daily_activity (activity_date, items_completed, focus_minutes) VALUES (?, ?, ?)',
                       (dt_str, stats.get('items_completed', 0), stats.get('minutes', 0)))

    conn.commit()
    conn.close()
