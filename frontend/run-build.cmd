@echo off
set "NODE_EXE=C:\Users\sabar\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%NODE_EXE%" node_modules/typescript/bin/tsc && "%NODE_EXE%" node_modules/vite/bin/vite.js build

