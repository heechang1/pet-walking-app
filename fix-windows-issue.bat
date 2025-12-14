@echo off
echo Windows 파일 잠금 문제 해결 중...
echo.

echo 1. Node 프로세스 종료 중...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. .next 폴더 삭제 중...
if exist .next (
    rmdir /s /q .next
    echo .next 폴더 삭제 완료
) else (
    echo .next 폴더가 없습니다
)

echo.
echo 3. 개발 서버 시작 중...
echo.
start cmd /k "npm run dev"
echo.
echo 서버가 새로운 창에서 시작됩니다.
echo 브라우저에서 http://localhost:3000 을 확인하세요.
echo.
pause

