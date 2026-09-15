@echo off
REM ============================================================
REM  Inicia el backend de Elyron (persistente en su propia ventana)
REM  Uso:  doble clic en este archivo, o desde terminal:
REM        start-backend.bat
REM ============================================================
cd /d "%~dp0"
echo Iniciando backend de Elyron en http://localhost:3000 ...
echo (deja esta ventana abierta mientras uses la app)
echo.
node dist/main
pause