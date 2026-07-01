# DortX Technologies

Official production website for DortX Technologies.

Website: https://www.dortxtech.com

Support: support@dortxtech.com

Founder: thrisha@dortxtech.com

Phone: +91 81509 90329

## Stack

- Frontend: React, CRACO, Tailwind CSS
- Backend: FastAPI, MongoDB, JWT authentication
- AI assistant: backend-powered conversational assistant for DortX services and lead qualification

## Production Build

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

## Backend

```bash
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

Required backend environment variables for production:

- `MONGO_URL`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `JWT_EXPIRE_MINUTES`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional, defaults to `gpt-4o-mini`)
- `UPLOAD_DIR`
- `CORS_ORIGINS`
