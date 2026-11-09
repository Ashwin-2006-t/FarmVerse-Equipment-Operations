@echo off
setlocal
set "NODE_EXE=C:\Users\sabar\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

echo ========================================================
echo Starting FarmVerse Nexus - Equipment Operations Frontend
echo Port: 5173
echo URL: http://localhost:5173
echo ========================================================

cd /d "%~dp0frontend"
"%NODE_EXE%" node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173

