# DortX Technologies Product Notes

## Overview

DortX Technologies is the official production website and admin platform for a premium AI, automation, and software development company.

## Architecture

- Frontend: React 19, React Router, Tailwind CSS, Framer Motion, Lucide React, Axios
- Backend: FastAPI, Motor, MongoDB, PyJWT, bcrypt, LLM-powered chatbot integration
- Storage: MongoDB collections for leads, applications, admins, chat messages, subscribers, and team members
- Auth: JWT bearer tokens with bcrypt password hashing
- Admin: hidden `/admin` console for leads, applications, newsletter subscribers, analytics, and team profiles

## Production Brand

- Company: DortX Technologies
- Website: https://www.dortxtech.com
- Support: support@dortxtech.com
- Founder: thrisha@dortxtech.com
- Phone: +91 99800 91281 | +91 81509 90329

## Public Pages

- Home
- About
- Services
- Technologies
- Process
- Team
- Portfolio
- Careers
- FAQ
- Contact
- Privacy Policy
- Terms & Conditions

## Key Production Requirements

- Official DortX logo used consistently across navigation, footer, chatbot, favicon, and previews
- Portfolio remains live with a coming-soon message and no placeholder cards
- Contact form submits to the backend and validates required fields
- Email links use `mailto:`
- Phone links use `tel:+918150990329`
- Company LinkedIn links open in a new tab
- Legal pages are linked from the footer
- SEO includes production title, description, Open Graph tags, Twitter cards, canonical URL, robots.txt, and sitemap.xml

## Deployment

Frontend:

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

Backend:

```bash
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```
