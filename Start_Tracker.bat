@echo off
title Prime AI/ML Course Tracker
cd /d "%~dp0"

echo ===================================================
echo     PRIME AI/ML COURSE TRACKER - MISSION CONTROL
echo ===================================================
echo.
echo [1/2] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not found in PATH! Please make sure Python 3 is installed.
    pause
    exit /b 1
)

echo [2/2] Launching Prime AI/ML Tracker server on port 5000...
start "" http://127.0.0.1:5000
python app.py
pause
