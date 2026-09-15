@echo off
title IA Service
cd /d "%~dp0"
echo ========================================
echo   IA Service corriendo en:
echo   http://localhost:8000
echo   (Ctrl+C para detener)
echo ========================================
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
