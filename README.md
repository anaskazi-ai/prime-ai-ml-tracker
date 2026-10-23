# 🧠 Prime AI/ML Course Tracker — dj's Mission Control

An enterprise-grade, human-centered curriculum tracker and video dashboard engineered for the comprehensive **Prime AI/ML Course** (62 Days, 818 core videos, 53 Jupyter Notebooks, 49 PDFs, ~117.1 video hours) plus the **Final Exam & Practice Vault**.

Features a **Dual-Mode Architecture**:
1. **Local Desktop Mode:** Python Flask + SQLite Relational Database (`tracker.db`), byte-range HTTP 206 video streamer, timestamp resume, and Windows native player & Explorer launching.
2. **Cloud / GitHub Pages Mode:** Zero-dependency static deployment via `/docs`, saving directly to browser `localStorage` with JSON export/import for phone, tablet, and cross-device tracking.

---

## ⚡ Quick Launch (Local Desktop)

Launch the tracker in any of these 3 easy ways on your Windows laptop:

1. **Desktop Shortcut:** Double-click `Prime AI-ML Course Tracker.bat` right on your **Windows Desktop**.
2. **From D: Drive:** Double-click `D:\AI-ML Prime Course\Launch_Course_Tracker.bat`.
3. **From Terminal:**
   ```powershell
   cd "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker"
   python app.py
   ```
   Open your browser to: **`http://127.0.0.1:5000`**

---

## 🌐 Deploy to GitHub & Host on GitHub Pages (Free)

For step-by-step instructions with exact copy-paste git commands, see:
👉 **[GITHUB_DEPLOYMENT_GUIDE.md](file:///C:/Users/anask/.gemini/antigravity/scratch/prime-ai-ml-tracker/GITHUB_DEPLOYMENT_GUIDE.md)**

Quick 3-step summary:
```bash
# 1. Add your GitHub remote repository
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/prime-ai-ml-tracker.git
git branch -M main
git push -u origin main

# 2. On GitHub: Repository Settings -> Pages -> Source: Deploy from branch -> main / /docs -> Save
# 3. Live URL generated in ~60 seconds: https://YOUR_GITHUB_USERNAME.github.io/prime-ai-ml-tracker/
```

---

## 🗄️ Relational Database Engine (SQLite)

All user activity is recorded in ACID-compliant SQLite (`tracker.db`). Legacy JSON progress automatically migrates on boot.

### Relational Schema (`schema.sql`):
- `completed_lessons`: Tracks completed item IDs, day IDs, and ISO completion timestamps.
- `starred_lessons`: High-yield revision bank bookmarks for exam preparation and interview refreshers.
- `notes`: Markdown personal takeaways, math derivations, and code snippets per study day.
- `pomodoro_logs`: Granular log of focus intervals (25m / 50m) linked to active study days.
- `playback_positions`: Exact resume timestamps and total video duration for automatic resume.
- `settings`: Configurable daily goals and last-active session state.
- `daily_activity`: Date-indexed aggregates of completed lectures and total focused study minutes.

---

## 🌟 Key Features

### 1. Dual Sidebar Navigation & Clean Layout
- **📅 All 62 Days View:** Rapid numeric scroll with day titles, completion badges, and counters.
- **📚 By Phase View:** 13 visual domain phases with color coding, badge pills, and expandable day groups.
- **🎯 Day Navigation:** `◀ Prev Day`, `Next Day ▶`, and an **Advance Next Day** banner at the bottom of every day.

### 2. Built-in In-Browser Theater Video Player
- Zero-buffer HTTP 206 Partial Content byte-range streaming.
- Speed controller (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `1.75x`, `2.0x`).
- Full keyboard controls:
  - `Space`: Play / Pause
  - `Arrow Left / Right`: Seek ±5 seconds
  - `F`: Fullscreen toggle
  - `Esc`: Close theater
- **Auto-Complete & Auto-Queue:** Automatically marks video as completed when ended and cues the next lecture in sequence.

### 3. Native Windows Laptop Launch & Explorer Reveal
- **`Launch` Button:** Direct `os.startfile()` execution into VLC, MPC-HC, Jupyter Notebook, or VS Code.
- **`Folder` Button:** Opens Windows File Explorer highlighting the exact lesson file (`explorer.exe /select`).

### 4. Pomodoro Focus Timer & Habit Engine
- Integrated in the top navigation bar (`Focus 25m`, `Short Break 5m`, `Long Break 15m`).
- Automatically logs focus minutes to your study log.
- Displays consecutive study streak (🔥) and daily target gauge (🎯).

### 5. Starred Revision Vault ⭐ & Exam Module
- Bookmark challenging lectures, math proofs, or algorithms.
- Dedicated modal with search, category filtering, and direct play links.
- Includes the **Final Exam & Practice Vault** (8 Question Banks + OOP/Math MCQ guides).

### 6. Instant Global Search (`Ctrl + K`)
- High-speed fuzzy search across all 900+ lectures, Jupyter notebooks, and PDFs.
- Jump directly to any lecture in 1 click.

### 7. Portable Backup & Cross-Device Sync
- Export/Import full state via portable JSON.
- Sync easily between your laptop SQLite database and your mobile/tablet browser.

---

## 📚 13-Phase Curriculum Breakdown

| Phase | Topics | Days | Total Videos |
|---|---|---|---|
| **Phase 1** | Python Core & OOP Mastery | DAY 01 – 06 | 98 |
| **Phase 2** | Data Science, NumPy, Pandas, SQL & Web Scraping | DAY 07 – 11 | 68 |
| **Phase 3** | Data Visualization & EDA (Matplotlib, Seaborn) | DAY 12 – 13 | 29 |
| **Phase 4** | Mathematics & Statistics for AI (Linear Algebra, Calculus) | DAY 14 – 16 | 40 |
| **Phase 5** | Machine Learning Mastery & Projects (Regression, Trees, SVM, Boosting) | DAY 17 – 27 | 158 |
| **Phase 6** | Developer Workflow & Version Control (Linux CLI, Git, GitHub) | DAY 28 – 29 | 24 |
| **Phase 7** | Deep Learning & Neural Networks (PyTorch, ANN, CNN, RNN) | DAY 30 – 35 | 93 |
| **Phase 8** | Reinforcement Learning & Deep RL (Q-Learning, DQN) | DAY 36 – 39 | 49 |
| **Phase 9** | Transformers, LLMs, RAG & OpenAI APIs | DAY 40 – 42, 45 – 47 | 81 |
| **Phase 10** | Frontend Layout & Fullstack Web for AI (CSS, Flexbox, Flask) | DAY 43 – 44, 48 – 52 | 84 |
| **Phase 11** | Generative AI, GANs & Agentic AI Frameworks | DAY 53 – 54 | 26 |
| **Phase 12** | Production Capstone Projects (Fullstack, Style Transfer, Pose CV) | DAY 55 – 60 | 56 |
| **Phase 13** | MLOps, CI/CD, Docker & Kubernetes Deployment | DAY 61 – 62 | 12 |
| **Vault** | Final Exam Question Banks & OOP/Math Guides | FINAL_EXAM | 8 Guides |

---

## 📁 Repository Structure

```text
prime-ai-ml-tracker/
├── app.py                      # Flask backend API & video streaming server
├── database.py                 # SQLite database layer with auto-migration
├── tracker.db                  # Local SQLite database (ACID persistent state)
├── schema.sql                  # Database table definitions & indices
├── requirements.txt            # Python dependencies (Flask, Werkzeug)
├── .gitignore                  # Git ignore rules for caches & OS files
├── README.md                   # Project documentation & reference
├── GITHUB_DEPLOYMENT_GUIDE.md  # Detailed GitHub push & Pages deployment guide
├── Start_Tracker.bat           # One-click Windows launcher
├── docs/                       # Static build folder for free GitHub Pages hosting
│   ├── index.html              # Standalone web app markup
│   ├── style.css               # Obsidian Dark styling
│   ├── app.js                  # Frontend controller with offline localStorage fallback
│   └── course_catalog.json     # Complete bundled catalog of all 62 days & 818 videos
└── static/                     # Flask static assets
    ├── index.html
    ├── style.css
    ├── app.js
    └── course_catalog.json
```

---

## 🧪 Tech Stack

- **Backend:** Python 3, Flask, SQLite3 (zero external database dependencies)
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 Custom Properties (Flexbox/Grid)
- **Typography:** Plus Jakarta Sans & JetBrains Mono (Google Fonts)
- **Hosting:** GitHub Pages (Static frontend) + Localhost (Full desktop capabilities)
