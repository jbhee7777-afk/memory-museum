@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js가 필요합니다. README.md의 다른 실행 방법을 확인해 주세요.
  pause
  exit /b 1
)
echo 브라우저에서 http://127.0.0.1:4173 을 열어 주세요.
echo 사용하는 동안 이 창을 열어 두세요. 종료하려면 Ctrl+C를 누릅니다.
node serve.cjs
pause
