@echo off
cd /d C:\Users\breys\OneDrive\Desktop\Elyron\backend
start "ElyronBackend" /min cmd /c "node dist/main >> backend-dev.log 2>> backend.err.log"