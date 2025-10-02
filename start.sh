#!/bin/bash

echo "=========================================="
echo "TTRPG Combat Tracker - Запуск"
echo "=========================================="
echo ""

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "ОШИБКА: Node.js не установлен!"
    echo "Установите Node.js:"
    echo "  - macOS: brew install node"
    echo "  - Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  - Fedora: sudo dnf install nodejs npm"
    echo ""
    exit 1
fi

echo "Node.js обнаружен: $(node --version)"
echo "npm версия: $(npm --version)"
echo ""

# Проверка наличия node_modules
if [ ! -d "node_modules" ]; then
    echo "Папка node_modules не найдена."
    echo "Выполняется установка зависимостей..."
    echo "Это может занять несколько минут..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "ОШИБКА: Не удалось установить зависимости!"
        exit 1
    fi
fi

# Проверка файла .env
if [ ! -f ".env" ]; then
    echo ""
    echo "ВНИМАНИЕ: Файл .env не найден!"
    echo "Пожалуйста, настройте файл .env с вашими ключами Supabase."
    echo "См. INSTALLATION.md для инструкций."
    echo ""
    exit 1
fi

echo ""
echo "=========================================="
echo "Запуск проекта в режиме разработки..."
echo "Приложение будет доступно на http://localhost:5000"
echo ""
echo "Нажмите Ctrl+C для остановки сервера"
echo "=========================================="
echo ""

npm run dev
