@echo off
title Stop Prime AI/ML Tracker
echo Stopping Prime AI/ML Tracker background server...
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*prime-ai-ml-tracker*app.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; echo ('Stopped process ' + $_.ProcessId) }"
echo Server stopped.
timeout /t 2 >nul
exit /b 0
