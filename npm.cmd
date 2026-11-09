@echo off
set "NODE_EXE=C:\Users\sabar\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "PNPM_CMD=C:\Users\sabar\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
set "PATH=C:\Users\sabar\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
call "%PNPM_CMD%" %*

