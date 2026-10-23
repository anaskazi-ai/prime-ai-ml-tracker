$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "Prime AI-ML Course Tracker.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker\launch_tracker.ps1"'
$Shortcut.WorkingDirectory = "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker"
$Shortcut.IconLocation = "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker\app_icon.ico,0"
$Shortcut.Description = "Apna College - Prime AI/ML Classroom Tracker"
$Shortcut.Save()
Write-Output "SUCCESS: Shortcut created at $ShortcutPath"
