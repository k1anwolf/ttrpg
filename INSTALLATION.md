# Установка и запуск TTRPG Combat Tracker локально

## Требования

- Node.js версии 18 или выше
- npm (входит в состав Node.js)
- Аккаунт Supabase (бесплатный)

## Шаг 1: Установка Node.js

Если Node.js еще не установлен:

### Windows
1. Скачайте установщик с https://nodejs.org/
2. Запустите установщик и следуйте инструкциям
3. Проверьте установку: откройте командную строку и введите:
   ```bash
   node --version
   npm --version
   ```

### macOS
```bash
# Используя Homebrew
brew install node
```

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm
```

## Шаг 2: Распаковка проекта

1. Скачайте архив `ttrpg-combat-tracker.tar.gz`
2. Распакуйте его в желаемую папку:

### Windows (с помощью 7-Zip или WinRAR)
- Щелкните правой кнопкой мыши по архиву
- Выберите "Extract Here" или "Извлечь"

### macOS/Linux
```bash
tar -xzf ttrpg-combat-tracker.tar.gz
cd project
```

## Шаг 3: Настройка Supabase

### 3.1 Создание проекта Supabase

1. Перейдите на https://supabase.com/
2. Создайте бесплатный аккаунт (если нет)
3. Создайте новый проект:
   - Нажмите "New Project"
   - Укажите имя проекта: `ttrpg-combat-tracker`
   - Создайте и сохраните пароль базы данных
   - Выберите регион (ближайший к вам)
   - Дождитесь создания проекта (1-2 минуты)

### 3.2 Получение ключей доступа

1. В Supabase перейдите в Settings → API
2. Скопируйте:
   - **Project URL** (например: https://xxxxx.supabase.co)
   - **anon public** ключ

### 3.3 Настройка файла .env

В папке проекта найдите файл `.env` и откройте его в текстовом редакторе.

Замените значения на свои:

```bash
DATABASE_URL="postgresql://postgres:[ВАШ_ПАРОЛЬ]@db.[ВАШ_PROJECT_REF].supabase.co:5432/postgres"
VITE_SUPABASE_URL="https://[ВАШ_PROJECT_REF].supabase.co"
VITE_SUPABASE_ANON_KEY="[ВАШ_ANON_KEY]"
```

Пример:
```bash
DATABASE_URL="postgresql://postgres:mypassword123@db.abcdefghij.supabase.co:5432/postgres"
VITE_SUPABASE_URL="https://abcdefghij.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Шаг 4: Установка зависимостей

Откройте терминал/командную строку в папке проекта и выполните:

```bash
npm install
```

Это займет 2-5 минут. npm скачает все необходимые библиотеки.

## Шаг 5: Создание таблиц в базе данных

### Вариант А: Через Supabase Dashboard (рекомендуется)

1. Откройте проект в Supabase Dashboard
2. Перейдите в SQL Editor (слева в меню)
3. Нажмите "New query"
4. Скопируйте содержимое файла `supabase/migrations/20251001103639_create_combat_tracker_schema.sql`
5. Вставьте в редактор SQL
6. Нажмите "Run" или Ctrl+Enter
7. Дождитесь сообщения об успешном выполнении

### Вариант Б: Через Supabase CLI (для продвинутых)

```bash
# Установка Supabase CLI
npm install -g supabase

# Вход в аккаунт
supabase login

# Связывание с проектом
supabase link --project-ref [ВАШ_PROJECT_REF]

# Применение миграций
supabase db push
```

## Шаг 6: Запуск проекта

### Режим разработки (Development)

```bash
npm run dev
```

Проект запустится на http://localhost:5000

### Продакшн сборка и запуск

```bash
npm run build
npm start
```

Проект запустится на http://localhost:5000

## Шаг 7: Открытие в браузере

Откройте браузер и перейдите по адресу:
```
http://localhost:5000
```

## Решение проблем

### Ошибка "Cannot find module"
```bash
# Удалите node_modules и установите заново
rm -rf node_modules package-lock.json
npm install
```

### Ошибка подключения к базе данных
1. Проверьте правильность данных в `.env`
2. Убедитесь, что миграция выполнена успешно
3. Проверьте, что проект Supabase активен

### Порт 5000 уже занят
Измените порт в файле `server/index.ts`:
```typescript
const port = process.env.PORT || 5001; // Измените на другой порт
```

### Ошибки TypeScript
```bash
npm run check
```

### Проблемы со сборкой
```bash
npm run build
```

## Полезные команды

```bash
# Разработка с автоперезагрузкой
npm run dev

# Проверка TypeScript
npm run check

# Сборка проекта
npm run build

# Запуск продакшн версии
npm start

# Обновление базы данных
npm run db:push
```

## Структура проекта

```
project/
├── client/              # Frontend приложение
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы
│   │   └── ...
├── server/              # Backend сервер
├── shared/              # Общие типы и схемы
├── supabase/            # Миграции базы данных
│   └── migrations/
├── .env                 # Переменные окружения
├── package.json         # Зависимости проекта
└── vite.config.ts       # Конфигурация Vite

```

## Дополнительная информация

- **Документация функций**: См. файл `FEATURES.md`
- **Техническая документация**: См. файл `README.md` (если есть)
- **Supabase документация**: https://supabase.com/docs

## Backup и восстановление данных

### Экспорт данных
1. Откройте Supabase Dashboard
2. Перейдите в Table Editor
3. Выберите таблицу → Export → CSV/JSON

### Импорт данных
1. Откройте Supabase Dashboard
2. Перейдите в Table Editor
3. Выберите таблицу → Import → Загрузите CSV/JSON

## Обновление проекта

Если вы получили обновленную версию:

```bash
# Сохраните .env файл в безопасное место
cp .env .env.backup

# Распакуйте новую версию
# Восстановите .env
cp .env.backup .env

# Переустановите зависимости
npm install

# Запустите проект
npm run dev
```

## Поддержка

При возникновении проблем:
1. Проверьте логи в консоли браузера (F12)
2. Проверьте логи сервера в терминале
3. Убедитесь, что все переменные окружения настроены правильно
4. Проверьте статус Supabase проекта в Dashboard
