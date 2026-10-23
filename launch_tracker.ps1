# Prime AI/ML Course Tracker - Desktop Launcher
$ProjectDir = "C:\Users\anask\.gemini\antigravity\scratch\prime-ai-ml-tracker"
Set-Location $ProjectDir

# 1. Check if server is already running on port 5000
$IsRunning = $false
try {
    $res = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/progress" -UseBasicParsing -TimeoutSec 1
    if ($res.StatusCode -eq 200) { $IsRunning = $true }
} catch {
    $IsRunning = $false
}

# 2. If not running, start background Python process
if (-not $IsRunning) {
    Start-Process -FilePath "python.exe" -ArgumentList "app.py" -WorkingDirectory $ProjectDir -WindowStyle Hidden
    for ($i = 0; $i -lt 10; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $test = Invoke-WebRequest -Uri "http://127.0.0.1:5000" -UseBasicParsing -TimeoutSec 1
            if ($test.StatusCode -eq 200) { break }
        } catch {}
    }
}

# 3. Launch in Chrome App Window mode (Standalone Desktop Look)
$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$Edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if (Test-Path $Chrome) {
    Start-Process -FilePath $Chrome -ArgumentList '--app="http://127.0.0.1:5000"'
} elseif (Test-Path $Edge) {
    Start-Process -FilePath $Edge -ArgumentList '--app="http://127.0.0.1:5000"'
} else {
    Start-Process "http://127.0.0.1:5000"
}
