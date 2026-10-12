@echo off
title Push JobCommand to GitHub with Token
cd /d "%~dp0"
chcp 65001 >nul
echo ========================================================
echo   ส่งโค้ดขึ้น https://github.com/ICTSFC-DEV/jobcommand.git
echo ========================================================
echo.
echo กรุณาวาง Personal Access Token (PAT) ของบัญชี ICTSFC-DEV:
echo (สร้างได้ที่: GitHub Settings -> Developer settings -> Personal access tokens)
echo.
set /p TOKEN="วาง Token ที่นี่: "
if "%TOKEN%"=="" (
    echo [!] ไม่ได้ระบุ Token
    pause
    exit /b
)
git remote set-url origin https://ICTSFC-DEV:%TOKEN%@github.com/ICTSFC-DEV/jobcommand.git
echo.
echo กำลัง Push โค้ด...
git push -u origin main
echo.
echo ========================================================
if %errorlevel% equ 0 (
    echo [OK] ส่งโค้ดขึ้น GitHub เรียบร้อยแล้ว!
) else (
    echo [!] ไม่สามารถส่งโค้ดได้ กรุณาตรวจสอบสิทธิ์ของ Token
)
echo ========================================================
pause
