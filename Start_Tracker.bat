@echo off
title Apna College - Prime AI/ML Classroom Tracker
cd /d "%~dp0"

echo ===================================================
echo   APNA COLLEGE - PRIME AI/ML CLASSROOM TRACKER
echo ===================================================
echo.
echo [1/2] Checking local backend server status...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch_tracker.ps1"

exit /b 0
