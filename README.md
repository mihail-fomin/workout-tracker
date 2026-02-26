# WorkoutTracker

Fullstack веб-приложение для логирования и отслеживания тренировок.

## Технологический стек

- **Frontend + Backend**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Prisma 7
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Calendar**: react-big-calendar
- **Containerization**: Docker + docker-compose

## Функциональность

### Дашборд (/)
- Последние 5 тренировок
- Статистика за неделю/месяц (тренировки, объём, время)
- Быстрая кнопка "Начать тренировку"

### Журнал тренировок (/workouts)
- Список всех тренировок с фильтрацией по типу и дате
- Создание новой тренировки с упражнениями и подходами
- Редактирование и удаление тренировок

### Библиотека упражнений (/exercises)
- 45+ предустановленных упражнений
- Поиск и фильтрация по типу и мышечной группе
- Добавление своих упражнений
- История использования и прогресс по каждому упражнению

### Календарь (/calendar)
- Месячный/недельный вид тренировок
- Цветовая кодировка по типу тренировки
- Просмотр деталей при клике

### Графики прогресса (/progress)
- Объём нагрузки по неделям (LineChart)
- Частота тренировок (BarChart)
- Распределение по типам (PieChart)
- Прогресс по конкретному упражнению

### Интеграция Samsung Health (/settings/integrations)
- OAuth2 авторизация
- Синхронизация тренировок
- Маппинг типов тренировок
- Дедупликация данных

## Быстрый старт

### Требования
- Node.js 20+
- Docker и Docker Compose
- npm

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd workout-tracker
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` из примера:
```bash
cp .env.example .env
```

4. Запустите PostgreSQL в Docker:
```bash
docker compose up -d db
```

5. Примените схему базы данных:
```bash
npm run db:push
```

6. Заполните базу начальными данными:
```bash
npm run db:seed
```

7. Запустите приложение:
```bash
npm run dev
```

Приложение будет доступно по адресу http://localhost:3000

## Скрипты

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для production
- `npm run start` - запуск production сервера
- `npm run lint` - проверка кода
- `npm run db:generate` - генерация Prisma клиента
- `npm run db:push` - применение схемы к БД
- `npm run db:migrate` - создание миграции
- `npm run db:seed` - заполнение начальными данными
- `npm run db:studio` - запуск Prisma Studio

## Docker

Для запуска всего приложения в Docker:

```bash
docker compose up -d
```

Это запустит:
- PostgreSQL на порту 5433
- Next.js приложение на порту 3000

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| DATABASE_URL | URL подключения к PostgreSQL |
| SAMSUNG_HEALTH_CLIENT_ID | Client ID для Samsung Health API |
| SAMSUNG_HEALTH_CLIENT_SECRET | Client Secret для Samsung Health API |
| SAMSUNG_HEALTH_REDIRECT_URI | Redirect URI для OAuth (например: `http://localhost:3000/api/samsung-health/callback`) |

## Подключение Samsung Health

1. **Настройте `.env`** — укажите `SAMSUNG_HEALTH_CLIENT_ID`, `SAMSUNG_HEALTH_CLIENT_SECRET` и `SAMSUNG_HEALTH_REDIRECT_URI`.

2. **Получите учётные данные** — зарегистрируйте приложение в [Samsung Developer](https://developer.samsung.com) и подайте [Partnership Request](https://developer.samsung.com/health/data/process.html) для Samsung Health Data SDK.

3. **В приложении** — откройте `/settings/integrations`, нажмите «Подключить Samsung Health» и пройдите OAuth.

4. **Синхронизация** — выберите период (7–90 дней) и нажмите «Синхронизировать».

> **Примечание:** Официальный [Samsung Health Data SDK](https://developer.samsung.com/health/data/overview.html) ориентирован на Android. Для веб-приложений уточните у Samsung наличие OAuth2 REST API.

## Структура проекта

```
workout-tracker/
├── prisma/
│   ├── schema.prisma      # Схема базы данных
│   └── seed.ts            # Начальные данные
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── calendar/      # Страница календаря
│   │   ├── exercises/     # Страницы упражнений
│   │   ├── progress/      # Страница прогресса
│   │   ├── settings/      # Страница настроек
│   │   └── workouts/      # Страницы тренировок
│   ├── components/        # React компоненты
│   │   ├── calendar/      # Компоненты календаря
│   │   ├── charts/        # Компоненты графиков
│   │   ├── exercise/      # Компоненты упражнений
│   │   ├── layout/        # Layout компоненты
│   │   ├── ui/            # shadcn/ui компоненты
│   │   └── workout/       # Компоненты тренировок
│   ├── lib/               # Утилиты и библиотеки
│   └── types/             # TypeScript типы
├── docker-compose.yml     # Docker конфигурация
├── Dockerfile             # Multi-stage Dockerfile
└── package.json
```

## Лицензия

MIT
# workout-tracker
