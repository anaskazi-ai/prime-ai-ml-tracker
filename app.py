import os
import sys
import json
import re
import csv
import subprocess
from datetime import datetime, date
from flask import Flask, request, jsonify, send_from_directory, Response
import database as db

# Initialize SQLite database schema and migrate legacy data if needed
db.init_db()

app = Flask(__name__, static_folder='static', static_url_path='')

COURSE_DIR = r"D:\AI-ML Prime Course"
EXAM_DIR = r"D:\Final exam"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "tracker_data.json")

# 13 Structured Learning Phases
PHASE_DEFINITIONS = [
    {
        'id': 'phase_1',
        'title': 'Phase 1: Python Core & OOP Mastery',
        'badge': 'Python & OOP',
        'color': '#3b82f6',
        'days': ['DAY 01', 'DAY 02', 'DAY 03', 'DAY 04', 'DAY 05', 'DAY 06'],
        'desc': 'Python fundamentals, conditionals, loops, lists, dictionaries, OOP classes & methods, and file handling.'
    },
    {
        'id': 'phase_2',
        'title': 'Phase 2: Data Science, NumPy, Pandas & SQL',
        'badge': 'Data Wrangling',
        'color': '#06b6d4',
        'days': ['DAY 07', 'DAY 08', 'DAY 09', 'DAY 10', 'DAY 11'],
        'desc': 'NumPy arrays, Pandas dataframes, data transformation, SQL queries, and BeautifulSoup web scraping.'
    },
    {
        'id': 'phase_3',
        'title': 'Phase 3: Data Visualization & EDA',
        'badge': 'Visualization',
        'color': '#10b981',
        'days': ['DAY 12', 'DAY 13'],
        'desc': 'Matplotlib & Seaborn visual storytelling, distributions, bar charts, scatter plots, and EDA charts.'
    },
    {
        'id': 'phase_4',
        'title': 'Phase 4: Mathematics & Statistics for AI',
        'badge': 'Math for AI',
        'color': '#8b5cf6',
        'days': ['DAY 14', 'DAY 15', 'DAY 16'],
        'desc': 'Probability distributions, Bayes theorem, Linear Algebra vectors & matrices, and Calculus derivatives.'
    },
    {
        'id': 'phase_5',
        'title': 'Phase 5: Machine Learning Mastery & Projects',
        'badge': 'Machine Learning',
        'color': '#f59e0b',
        'days': ['DAY 17', 'DAY 18', 'DAY 19', 'DAY 20', 'DAY 21', 'DAY 22', 'DAY 23', 'DAY 24', 'DAY 25', 'DAY 26', 'DAY 27'],
        'desc': 'Supervised & Unsupervised ML: Linear/Lasso Regression, kNN, Logistic, Trees, Ensembles, SVM, Clustering & PCA.'
    },
    {
        'id': 'phase_6',
        'title': 'Phase 6: Developer Workflow & Version Control',
        'badge': 'Dev Workflow',
        'color': '#ec4899',
        'days': ['DAY 28', 'DAY 29'],
        'desc': 'Linux bash command line, file navigation, Git version control, GitHub branching, merging and collaboration.'
    },
    {
        'id': 'phase_7',
        'title': 'Phase 7: Deep Learning & Neural Networks',
        'badge': 'Deep Learning',
        'color': '#6366f1',
        'days': ['DAY 30', 'DAY 31', 'DAY 32', 'DAY 33', 'DAY 34', 'DAY 35'],
        'desc': 'Artificial Neural Networks, PyTorch tensors, forward/backprop, CNNs for image classification, and RNNs for NLP.'
    },
    {
        'id': 'phase_8',
        'title': 'Phase 8: Reinforcement Learning & Deep RL',
        'badge': 'RL & DQN',
        'color': '#14b8a6',
        'days': ['DAY 36', 'DAY 37', 'DAY 38', 'DAY 39'],
        'desc': 'Markov Decision Processes, Q-Learning, Deep Q-Networks (DQN), Experience Replay, and epsilon-greedy exploration.'
    },
    {
        'id': 'phase_9',
        'title': 'Phase 9: Transformers, LLMs, RAG & OpenAI APIs',
        'badge': 'LLM & RAG',
        'color': '#a855f7',
        'days': ['DAY 40', 'DAY 41', 'DAY 42', 'DAY 45', 'DAY 46', 'DAY 47'],
        'desc': 'HuggingFace Transformers, Attention mechanisms, RAG architectures, Vector DBs, and OpenAI API integrations.'
    },
    {
        'id': 'phase_10',
        'title': 'Phase 10: Frontend Layout & Fullstack Web for AI',
        'badge': 'Fullstack AI UI',
        'color': '#f97316',
        'days': ['DAY 43', 'DAY 44', 'DAY 48', 'DAY 49', 'DAY 50', 'DAY 51', 'DAY 52'],
        'desc': 'CSS Box model, Flexbox, CSS Grid, Flask web server, dynamic AI templates, and fullstack app development.'
    },
    {
        'id': 'phase_11',
        'title': 'Phase 11: Generative AI, GANs & Agentic AI',
        'badge': 'GenAI & Agents',
        'color': '#ef4444',
        'days': ['DAY 53', 'DAY 54'],
        'desc': 'Generative Adversarial Networks (GANs), Generators/Discriminators, and Autonomous Agentic AI frameworks with Streamlit.'
    },
    {
        'id': 'phase_12',
        'title': 'Phase 12: Production Capstone Projects',
        'badge': 'Capstone Projects',
        'color': '#eab308',
        'days': ['DAY 55', 'DAY 56', 'DAY 57', 'DAY 58', 'DAY 59', 'DAY 60'],
        'desc': 'Fullstack Database AI app, Neural Style Transfer with AdaIN/PyTorch, and Real-Time Pose/Rep Counter CV app.'
    },
    {
        'id': 'phase_13',
        'title': 'Phase 13: MLOps, CI/CD, Docker & Kubernetes',
        'badge': 'MLOps & K8s',
        'color': '#0ea5e9',
        'days': ['DAY 61', 'DAY 62'],
        'desc': 'CI/CD pipelines with GitHub Actions, testing, AWS EC2, Kubernetes architecture, Pods, Services, and Helm.'
    }
]

def natural_sort_key(s):
    """Natural numeric human sort: '2. Intro' comes before '10. Intro'."""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', str(s))]

def load_durations_map():
    durations = {}
    csv_path = os.path.join(COURSE_DIR, 'course_video_details.csv')
    if os.path.exists(csv_path):
        try:
            with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
                reader = csv.reader(f)
                next(reader)
                for row in reader:
                    if len(row) >= 5:
                        name = row[0].strip()
                        module = row[1].strip()
                        try:
                            sec = float(row[3].strip() or 0)
                            m = int(sec // 60)
                            s = int(sec % 60)
                            dur_str = f"{m}m {s:02d}s" if m > 0 else f"{s}s"
                            durations[(module.upper(), name.lower())] = (dur_str, sec)
                            durations[name.lower()] = (dur_str, sec)
                        except:
                            pass
        except Exception as e:
            print("Warning: could not read durations CSV:", e)
    return durations

def load_data():
    try:
        return db.get_progress()
    except Exception as e:
        print("Error reading database:", e)
        return {
            "completed_items": {},
            "starred_items": {},
            "notes": {},
            "daily_target": 5,
            "pomodoro_history": [],
            "study_log": {},
            "playback_positions": {},
            "last_active": {"day_id": "DAY 01", "item_id": None}
        }

def save_data(data):
    try:
        db.restore_backup(data)
        return True
    except Exception as e:
        print("Error saving database backup:", e)
        return False

_course_catalog_cache = None

def get_day_phase(day_id):
    for p in PHASE_DEFINITIONS:
        if day_id in p['days']:
            return p
    return {
        'id': 'extra',
        'title': 'Additional Modules',
        'badge': 'Exam & Practice',
        'color': '#64748b',
        'desc': 'Exam question banks and practice code'
    }

def clean_lecture_info(filename):
    """Extracts lecture number and a polished clean title."""
    base = os.path.splitext(filename)[0]
    base = re.sub(r'\s*\(\d+\)$', '', base) # remove trailing (1)
    base = re.sub(r'-LAPTOP-[A-Z0-9]+', '', base) # remove laptop conflict

    m = re.match(r'^(\d+)(?:[\.\-\)]|\s+)(.*)$', base)
    if m:
        num = int(m.group(1))
        title = m.group(2).strip()
    else:
        num = None
        title = base.strip()

    title = title.replace('_', ' ')
    if not title:
        title = base
    return num, title

def scan_course_directory():
    global _course_catalog_cache
    if _course_catalog_cache is not None:
        return _course_catalog_cache

    if not os.path.exists(COURSE_DIR):
        return {"error": f"Course path {COURSE_DIR} does not exist", "days": [], "phases": PHASE_DEFINITIONS}

    durations_map = load_durations_map()

    day_dirs = [d for d in os.listdir(COURSE_DIR) if os.path.isdir(os.path.join(COURSE_DIR, d))]
    day_dirs.sort(key=lambda x: int(re.search(r'\d+', x).group()) if re.search(r'\d+', x) else 9999)

    days_data = []
    total_videos = 0
    total_items = 0
    total_bytes = 0
    total_seconds = 0

    for d in day_dirs:
        dp = os.path.join(COURSE_DIR, d)
        day_num = int(re.search(r'\d+', d).group()) if re.search(r'\d+', d) else 0

        raw_files = os.listdir(dp)
        # Filter out redundant OneDrive / Laptop conflict duplicates if primary version exists
        cleaned_file_list = []
        for f in raw_files:
            if '-LAPTOP-' in f:
                clean_equiv = re.sub(r'-LAPTOP-[A-Z0-9]+', '', f)
                if clean_equiv in raw_files:
                    continue # Skip duplicate!
            cleaned_file_list.append(f)

        # Sort naturally (1, 2, 3... 10, 11)
        cleaned_file_list.sort(key=natural_sort_key)

        items = []
        day_seconds = 0

        for f in cleaned_file_list:
            full_p = os.path.join(dp, f)
            if not os.path.isfile(full_p):
                continue

            rel_p = os.path.relpath(full_p, COURSE_DIR)
            ext = os.path.splitext(f)[1].lower()
            size = os.path.getsize(full_p)
            total_bytes += size

            item_type = 'other'
            if ext in ['.mp4', '.mkv', '.webm', '.avi', '.mov']:
                item_type = 'video'
                total_videos += 1
            elif ext == '.ipynb':
                item_type = 'notebook'
            elif ext == '.pdf':
                item_type = 'pdf'
            elif ext in ['.csv', '.xlsx', '.json', '.parquet']:
                item_type = 'dataset'
            elif ext in ['.py', '.sh', '.yaml', '.yml', '.html', '.css', '.js', '.docx']:
                item_type = 'code'

            lec_num, clean_title = clean_lecture_info(f)

            # Get duration
            dur_info = durations_map.get((d.upper(), f.lower())) or durations_map.get(f.lower())
            if dur_info:
                duration_str, sec_val = dur_info
            else:
                # Estimate 8 mins for videos if not in map
                if item_type == 'video':
                    sec_val = 480
                    duration_str = "~8m"
                else:
                    sec_val = 0
                    duration_str = ""

            day_seconds += sec_val
            total_seconds += sec_val

            items.append({
                'id': f"{d}_{f}",
                'raw_name': f,
                'clean_title': clean_title,
                'lecture_num': lec_num,
                'ext': ext,
                'type': item_type,
                'size': size,
                'size_mb': round(size / (1024 * 1024), 2),
                'duration': duration_str,
                'seconds': sec_val,
                'is_mkv': ext == '.mkv',
                'rel_path': rel_p.replace('\\', '/'),
                'full_path': full_p
            })
            total_items += 1

        phase_info = get_day_phase(d)
        day_mins = int(day_seconds // 60)
        day_dur_label = f"{day_mins // 60}h {day_mins % 60}m" if day_mins >= 60 else f"{day_mins}m"

        days_data.append({
            'day_id': d,
            'day_num': day_num,
            'title': f"Day {day_num:02d}",
            'folder_name': d,
            'phase_id': phase_info['id'],
            'phase_title': phase_info['title'],
            'phase_badge': phase_info['badge'],
            'phase_color': phase_info['color'],
            'total_items': len(items),
            'videos_count': len([i for i in items if i['type'] == 'video']),
            'notebooks_count': len([i for i in items if i['type'] == 'notebook']),
            'pdfs_count': len([i for i in items if i['type'] == 'pdf']),
            'datasets_count': len([i for i in items if i['type'] == 'dataset']),
            'total_size_mb': round(sum(i['size'] for i in items) / (1024 * 1024), 2),
            'total_duration': day_dur_label,
            'total_seconds': day_seconds,
            'items': items
        })

    # Add Final Exam & Practice Vault module if exists
    if os.path.exists(EXAM_DIR):
        exam_files = [f for f in os.listdir(EXAM_DIR) if os.path.isfile(os.path.join(EXAM_DIR, f))]
        exam_files.sort(key=natural_sort_key)
        exam_items = []
        for f in exam_files:
            fp = os.path.join(EXAM_DIR, f)
            sz = os.path.getsize(fp)
            ext = os.path.splitext(f)[1].lower()
            itype = 'pdf' if ext == '.pdf' else ('doc' if ext in ['.docx', '.doc'] else 'other')
            exam_items.append({
                'id': f"EXAM_{f}",
                'raw_name': f,
                'clean_title': os.path.splitext(f)[0].replace('_', ' '),
                'lecture_num': None,
                'ext': ext,
                'type': itype,
                'size': sz,
                'size_mb': round(sz / (1024 * 1024), 2),
                'duration': "Question Bank",
                'seconds': 0,
                'is_mkv': False,
                'rel_path': f"Final exam/{f}",
                'full_path': fp
            })

        if exam_items:
            days_data.append({
                'day_id': 'FINAL_EXAM',
                'day_num': 99,
                'title': 'Final Exam & Question Banks',
                'folder_name': 'Final exam',
                'phase_id': 'extra',
                'phase_title': 'Exam & Practice Vault',
                'phase_badge': 'Exam Prep',
                'phase_color': '#e11d48',
                'total_items': len(exam_items),
                'videos_count': 0,
                'notebooks_count': 0,
                'pdfs_count': len([i for i in exam_items if i['type'] == 'pdf']),
                'datasets_count': 0,
                'total_size_mb': round(sum(i['size'] for i in exam_items) / (1024 * 1024), 2),
                'total_duration': "8 QB Guides",
                'total_seconds': 0,
                'items': exam_items
            })

    total_hours = round(total_seconds / 3600, 1)

    _course_catalog_cache = {
        'course_title': 'Prime AI/ML Full-Stack Mastery',
        'course_dir': COURSE_DIR,
        'total_days': len(day_dirs),
        'total_videos': total_videos,
        'total_items': total_items,
        'total_hours': total_hours,
        'total_size_gb': round(total_bytes / (1024 ** 3), 2),
        'phases': PHASE_DEFINITIONS,
        'days': days_data
    }
    return _course_catalog_cache

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Range'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    # Prevent browser caching of development assets
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    return response

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/catalog', methods=['GET'])
def api_catalog():
    data = scan_course_directory()
    return jsonify(data)

@app.route('/api/progress', methods=['GET'])
def api_get_progress():
    data = db.get_progress()
    return jsonify(data)

@app.route('/api/progress/toggle', methods=['POST'])
def api_toggle_item():
    req = request.json or {}
    item_id = req.get('item_id')
    completed = bool(req.get('completed'))
    if not item_id:
        return jsonify({'error': 'Missing item_id'}), 400

    total_completed, today_log = db.toggle_item(item_id, completed)
    return jsonify({
        'success': True,
        'item_id': item_id,
        'completed': completed,
        'total_completed': total_completed,
        'today_log': today_log
    })

@app.route('/api/progress/batch-day', methods=['POST'])
def api_batch_day():
    req = request.json or {}
    day_id = req.get('day_id')
    mark_as = bool(req.get('mark_as', True))

    if not day_id:
        return jsonify({'error': 'Missing day_id'}), 400

    catalog = scan_course_directory()
    day_data = next((d for d in catalog.get('days', []) if d['day_id'] == day_id), None)
    if not day_data:
        return jsonify({'error': 'Day not found'}), 404

    total_completed = db.batch_day(day_id, day_data.get('items', []), mark_as)
    return jsonify({
        'success': True,
        'day_id': day_id,
        'marked_as': mark_as,
        'total_completed': total_completed
    })

@app.route('/api/progress/bookmark', methods=['POST'])
def api_toggle_bookmark():
    req = request.json or {}
    item_id = req.get('item_id')
    if not item_id:
        return jsonify({'error': 'Missing item_id'}), 400

    new_state = db.toggle_star(item_id)
    return jsonify({'success': True, 'item_id': item_id, 'starred': new_state})

@app.route('/api/progress/notes', methods=['POST'])
def api_save_notes():
    req = request.json or {}
    key = req.get('key')
    note_content = req.get('content', '')

    if not key:
        return jsonify({'error': 'Missing note key'}), 400

    db.save_note(key, note_content)
    return jsonify({'success': True, 'key': key})

@app.route('/api/progress/playback-position', methods=['POST'])
def api_save_playback():
    req = request.json or {}
    item_id = req.get('item_id')
    current_time = float(req.get('current_time', 0))
    duration = float(req.get('duration', 0))

    if not item_id:
        return jsonify({'error': 'Missing item_id'}), 400

    db.save_playback(item_id, current_time, duration)
    return jsonify({'success': True})

@app.route('/api/progress/pomodoro', methods=['POST'])
def api_log_pomodoro():
    req = request.json or {}
    minutes = int(req.get('minutes', 25))
    day_id = req.get('day_id', '')

    db.log_pomodoro(minutes, day_id)
    data = db.get_progress()
    today_str = date.today().isoformat()
    today_mins = data.get('study_log', {}).get(today_str, {}).get('minutes', 0)

    return jsonify({
        'success': True,
        'today_minutes': today_mins
    })

@app.route('/api/progress/last-active', methods=['POST'])
def api_set_last_active():
    req = request.json or {}
    day_id = req.get('day_id')
    item_id = req.get('item_id')

    db.set_setting('last_active', json.dumps({
        'day_id': day_id,
        'item_id': item_id,
        'timestamp': datetime.now().isoformat()
    }))
    return jsonify({'success': True})

@app.route('/api/progress/target', methods=['POST'])
def api_set_target():
    req = request.json or {}
    target = int(req.get('daily_target', 5))
    db.set_setting('daily_target', target)
    return jsonify({'success': True, 'daily_target': target})

@app.route('/api/open-file', methods=['POST'])
def api_open_file():
    req = request.json or {}
    file_path = req.get('file_path')
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404

    try:
        os.startfile(file_path)
        return jsonify({'success': True, 'file_path': file_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reveal-file', methods=['POST'])
def api_reveal_file():
    req = request.json or {}
    file_path = req.get('file_path')
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404

    try:
        norm_path = os.path.normpath(file_path)
        subprocess.Popen(['explorer.exe', f'/select,{norm_path}'])
        return jsonify({'success': True, 'file_path': file_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/open-folder', methods=['POST'])
def api_open_folder():
    req = request.json or {}
    day_id = req.get('day_id')
    if day_id == 'FINAL_EXAM':
        folder_path = EXAM_DIR
    elif day_id:
        folder_path = os.path.join(COURSE_DIR, day_id)
    else:
        folder_path = COURSE_DIR

    if not os.path.exists(folder_path):
        return jsonify({'error': 'Folder not found'}), 404

    try:
        os.startfile(folder_path)
        return jsonify({'success': True, 'folder_path': folder_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stream')
def api_stream_video():
    file_path = request.args.get('path')
    if not file_path or not os.path.exists(file_path):
        return Response("Video file not found", status=404)

    range_header = request.headers.get('Range', None)
    file_size = os.path.getsize(file_path)

    if not range_header:
        def generate_full():
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(1024 * 512)
                    if not chunk:
                        break
                    yield chunk
        return Response(generate_full(), mimetype='video/mp4', headers={
            'Content-Length': str(file_size),
            'Accept-Ranges': 'bytes'
        })

    byte1 = 0
    byte2 = None
    m = re.search(r'(\d+)-(\d*)', range_header)
    if m:
        g = m.groups()
        if g[0]:
            byte1 = int(g[0])
        if g[1]:
            byte2 = int(g[1])

    if byte2 is None or byte2 >= file_size:
        byte2 = file_size - 1

    length = byte2 - byte1 + 1

    def generate_chunk():
        with open(file_path, 'rb') as f:
            f.seek(byte1)
            remaining = length
            while remaining > 0:
                read_amount = min(1024 * 512, remaining)
                data = f.read(read_amount)
                if not data:
                    break
                remaining -= len(data)
                yield data

    resp = Response(
        generate_chunk(),
        status=206,
        mimetype='video/mp4',
        direct_passthrough=True
    )
    resp.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
    resp.headers.add('Accept-Ranges', 'bytes')
    resp.headers.add('Content-Length', str(length))
    return resp

@app.route('/api/backup/export', methods=['GET'])
def api_export_backup():
    data = db.get_progress()
    return jsonify({
        'version': '2.0',
        'exported_at': datetime.now().isoformat(),
        'tracker_data': data
    })

@app.route('/api/backup/import', methods=['POST'])
def api_import_backup():
    req = request.json or {}
    backup = req.get('tracker_data')
    if not backup or not isinstance(backup, dict):
        return jsonify({'error': 'Invalid backup payload'}), 400

    db.restore_backup(backup)
    return jsonify({'success': True, 'message': 'Progress restored successfully to SQLite database'})

if __name__ == '__main__':
    print("Starting Prime AI/ML Course Tracker Engine on http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=False)
