@echo off
cd /d "%~dp0"

start "Laravel" cmd /k "cd /d backend && php artisan serve --port=8000"
start "Angular" cmd /k "cd /d frontend && npm start"
exit
