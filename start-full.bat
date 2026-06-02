@echo off
echo [SkillPilot AI] Starting backend API server...
start "SkillPilot-API" cmd /c "cd /d "%~dp0backend" && npm start"
echo [SkillPilot AI] Backend starting on port 5000...
timeout /t 3 /nobreak >nul
echo [SkillPilot AI] Starting frontend server...
start "SkillPilot-Frontend" cmd /c "cd /d "%~dp0" && node server.js"
echo [SkillPilot AI] Frontend starting on port 8080...
echo.
echo  Frontend: http://localhost:8080
echo  API:      http://localhost:5000/api
echo.
echo  Demo accounts:
echo    student@skillpilot.ai / demo123
echo    mentor@skillpilot.ai  / demo123
echo    recruiter@skillpilot.ai / demo123
echo    admin@skillpilot.ai   / admin123
echo.
echo  Close the Windows to stop both servers.
