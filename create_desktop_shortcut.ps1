$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$TargetFiles = @("Prime AI-ML Course Tracker.lnk", "Kazi Anas - Prime AI-ML Tracker.lnk")

foreach ($name in $TargetFiles) {
    $ShortcutPath = Join-Path $DesktopPath $name
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker\launch_tracker.ps1"'
    $Shortcut.WorkingDirectory = "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker"
    $Shortcut.IconLocation = "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker\app_icon.ico,0"
    $Shortcut.Description = "Apna College - Prime AI/ML Classroom Tracker | Kazi Anas"
    $Shortcut.Save()

    if (Test-Path "C:\Users\anask\Desktop") {
        Copy-Item -Path $ShortcutPath -Destination "C:\Users\anask\Desktop" -Force
    }
    Write-Output "Created: $name"
}
