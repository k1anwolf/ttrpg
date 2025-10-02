@echo off
echo ==========================================
echo TTRPG Combat Tracker - Запуск
echo ==========================================
echo.

REM Проверка наличия Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ОШИБКА: Node.js не установлен!
    echo Скачайте и установите Node.js с https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js обнаружен:
node --version
echo npm версия:
npm --version
echo.

REM Проверка наличия node_modules
if not exist "node_modules" (
    echo Папка node_modules не найдена.
    echo Выполняется установка зависимостей...
    echo Это может занять несколько минут...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ОШИБКА: Не удалось установить зависимости!
        pause
        exit /b 1
    )
)

REM Проверка файла .env
if not exist ".env" (
    echo.
    echo ВНИМАНИЕ: Файл .env не найден!
    echo Пожалуйста, настройте файл .env с вашими ключами Supabase.
    echo См. INSTALLATION.md для инструкций.
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Запуск проекта в режиме разработки...
echo Приложение будет доступно на http://localhost:5000
echo.
echo Нажмите Ctrl+C для остановки сервера
echo ==========================================
echo.

call npm run dev
