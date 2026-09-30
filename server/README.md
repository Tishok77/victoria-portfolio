# Backend

FastAPI + Uvicorn, Python 3. One process serves the static site at `/` and the API at `/api`
on port 8765; Victoria Portfolio.app starts it in the background. User-facing instructions and
settings are in the root `README.md` (section Backend).

## Принципы

- Все секреты (SMTP-пароль, в будущем ключ AI-сервиса и данные администратора) хранятся только на сервере: переменные окружения или `server/.env` (в git не попадает, сайтом не отдаётся). Во frontend-коде и `content/*.js` ключей нет.
- Frontend обращается только к собственному API: `js/config.js` → `api.baseUrl = '/api'`.
- Сторонние сервисы (почта, AI) вызываются только с сервера.
- Ответы с ошибками не содержат stack trace, путей, введённых данных или настроек.

## Структура

```
server/
├── requirements.txt        зависимости (pip install -r)
├── .env.example            образец настроек; настоящий .env — рядом, не публикуется
├── data/leads.db           SQLite (создаётся при первом запуске)
└── app/
    ├── main.py             приложение: статика (белый список), /api, обработка ошибок, заголовки
    ├── config.py           настройки из окружения / server/.env
    ├── db.py               подключение и миграции (PRAGMA user_version)
    ├── schemas.py          серверная валидация заявки
    ├── api/                health.py, leads.py; далее admin.py, assistant.py
    ├── repositories/       весь SQL (leads.py) — точка замены SQLite → PostgreSQL
    └── services/           notifications.py (email по SMTP)
```

## API

| Метод | Путь | Статус | Назначение |
|---|---|---|---|
| GET | `/api/health` | готово | `{"status":"ok"}` — проверка сервера (использует launcher) |
| POST | `/api/leads` | готово | заявка `{ name, phone, message }` → SQLite → email (если включён) |
| * | `/api/admin/*` | будущее | список, просмотр, смена статуса, архив, статистика заявок — после авторизации |
| POST | `/api/assistant` | будущее | сообщение AI-ассистенту |

`POST /api/leads`: `201 {"success": true}`; `422` — ошибка валидации (`fields` — список полей); `413` — тело больше 16 КБ;
`429` — больше `LEADS_RATE_LIMIT` заявок с одного IP за 10 минут; `500` — внутренняя ошибка.
Неизвестные поля игнорируются. Повтор той же заявки (телефон + сообщение) в течение 2 минут не создаёт новую запись.
Email отправляется после ответа клиенту; ошибка почты не теряет заявку (`notification_status = failed`).

## Дальше

- **Админка:** методы списка/просмотра/смены статуса — в `repositories/leads.py`, роуты — `api/admin.py`, авторизация — там же; UI — `/admin`.
- **AI-ассистент:** `api/assistant.py` + сервис с ключом из окружения; виджет монтируется в `[data-assistant-root]`, включается флагом `features.assistant` в `js/config.js`.
- **PostgreSQL:** заменить `db.py` и SQL в `repositories/`; API и frontend не меняются.
- **Контент через API** (`/api/cases`, `/api/reviews`, `/api/site`): тела функций в `js/api.js` переключаются на `fetch`, сигнатуры те же.

## Разработка

```bash
python3 -m venv server/.venv
server/.venv/bin/pip install -r server/requirements.txt
server/.venv/bin/python -m uvicorn app.main:app --app-dir server --port 8765 --reload
```
