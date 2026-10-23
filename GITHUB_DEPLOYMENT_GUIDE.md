# 🚀 GitHub Deployment & Hosting Guide
**Prime AI/ML Course Tracker** — dj's Mission Control Engine

---

## 🌟 Overview: Dual-Mode Architecture

Your Course Tracker supports **two deployment options**:

1. **Option A: GitHub Pages Cloud Host (Zero Setup, Free 24/7 Hosting)**
   - Host the frontend on GitHub Pages directly from the `/docs` folder.
   - Accessible from anywhere: your phone, tablet, office laptop, or friend's PC.
   - Saves all lesson checkboxes, daily targets, revision bookmarks, notes, and Pomodoros to browser `localStorage`.
   - Includes one-click JSON backup export & restore.

2. **Option B: Full Local Desktop App (Flask + SQLite + Local Video Streaming)**
   - Runs locally on your laptop with `Start_Tracker.bat`.
   - Saves all progress into SQLite relational database (`tracker.db`).
   - Streams videos with byte-range seeking and timestamp resume.
   - Launches files directly in Jupyter Notebook, VS Code, and Windows Explorer.

---

## 📦 Step 1: Create a New GitHub Repository

1. Open your browser and go to: **[https://github.com/new](https://github.com/new)**
2. Enter a **Repository name**, for example:
   ```text
   prime-ai-ml-tracker
   ```
3. Set visibility to **Public** (or **Private** — GitHub Pages is free for public repositories).
4. **Do NOT** check "Add a README file" or "Add .gitignore" (we already built customized, production versions for you).
5. Click **Create repository**.

---

## 💻 Step 2: Push Your Code to GitHub

Open PowerShell or Command Prompt, navigate to your project directory, and run the following commands (replace `YOUR_GITHUB_USERNAME` with your actual GitHub username):

```bash
cd "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker"

# 1. Rename branch to main
git branch -M main

# 2. Add your GitHub repository as origin remote
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/prime-ai-ml-tracker.git

# 3. Push all code, SQLite schema, and /docs bundle to GitHub
git push -u origin main
```

*(If you use SSH: `git remote add origin git@github.com:YOUR_GITHUB_USERNAME/prime-ai-ml-tracker.git`)*

---

## 🌐 Step 3: Enable Free GitHub Pages Web Hosting (1-Click)

1. On your GitHub repository page, click **Settings** (top right tab).
2. In the left sidebar, click **Pages** (under the "Code and automation" section).
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` (or `master`).
   - **Folder**: Select `/docs` (this is our pre-configured static build folder).
4. Click **Save**.
5. Within 60 seconds, GitHub will display your live web app URL:
   ```text
   https://YOUR_GITHUB_USERNAME.github.io/prime-ai-ml-tracker/
   ```

You can now bookmark this link on your phone, tablet, or browser and track your 62-Day AI/ML journey anywhere!

---

## 🔄 Step 4: Syncing Progress Between Cloud & Laptop

- **From Cloud/Phone to Laptop:**
  1. In the Web App, open **Settings ⚙️** -> Click **📥 Download Backup JSON**.
  2. On your Laptop, run `Start_Tracker.bat` -> Open **Settings ⚙️** -> Click **📤 Upload Backup JSON**.
  3. Your SQLite database (`tracker.db`) will immediately sync all progress!

- **From Laptop to Cloud:**
  1. On your Laptop, click **📥 Download Backup JSON**.
  2. In the Web App on your phone/tablet, click **📤 Upload Backup JSON**.
  3. Everything syncs instantly with zero data loss.

---

## 🛠️ Local Engine Quick Commands

To run the local desktop backend anytime:
```bash
# Double-click:
Start_Tracker.bat

# Or run in terminal:
python app.py
```
App opens automatically at `http://127.0.0.1:5000`.
