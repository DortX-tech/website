# DortX — Product Requirements (PRD)

## Original Problem Statement
Build the official production website for **DortX** — a premium technology studio. The site must look handcrafted and authentic — never inflated. The user chose React + FastAPI + MongoDB, Claude Sonnet 4.5 chatbot via Emergent LLM key, JWT-based internal admin auth, local file uploads, and professional editable team bios.

## Architecture
- **Frontend**: React 19 (CRA) + React Router + Tailwind CSS + Framer Motion + Lucide React + Axios
- **Backend**: FastAPI + Motor (MongoDB async) + PyJWT + bcrypt + `emergentintegrations` (Claude Sonnet 4.5)
- **Storage**: MongoDB (`leads`, `applications`, `admins`, `chat_messages`) + `/app/backend/uploads/`
- **Auth**: JWT bearer tokens, bcrypt password hashing, seeded super_admin on startup
- **AI**: `claude-sonnet-4-5-20250929` via Emergent Universal LLM Key

## User Personas
1. **Visitor / Prospect** — browses, asks the chatbot, fills the contact form.
2. **Job Applicant** — visits Careers, submits an application.
3. **Internal Admin** — signs into `/admin/login` to manage leads.

## Core Requirements
- 10 public pages (Home, About, Services, Portfolio, Process, Technologies, Team, Careers, FAQ, Contact)
- Floating DortX AI chatbot
- Admin dashboard (hidden from public nav) with CRUD, status workflow, CSV export, analytics
- SEO meta, OG, Twitter, robots.txt, sitemap.xml, Organization JSON-LD
- Dark-mode-first premium design — glassmorphism, Framer Motion, mouse parallax, magnetic CTAs

## What's Been Implemented

### v1 (2026-01) — MVP
- Full backend with auth, leads + file upload, careers, chat, admin CRUD, analytics, CSV export
- Seeded super-admin (`admin@dortx.com` / `Admin@DortX2026`)
- 10 public pages, floating DortX AI chatbot (Claude Sonnet 4.5)
- Backend tests **19/19 passing**; Frontend critical flows **100% verified**

### v2 — Premium handcraft pass
- Cinematic Home with storytelling: Hero → WhyExist → Problems → Approach → Wings → Process timeline → Tech marquee → Team → Industries → FAQ → CTA
- Mouse-responsive orbs, orbital tech graphic, magnetic CTAs, shimmer & gradient typography
- About page narrative rewrite

### v3 — Brand authenticity pass
- **Logo**: uses `mix-blend-mode: screen` so the asset's dark background dissolves into the nav — wordmark reads as part of the page, never cropped, never boxed
- **All exaggerated claims removed**: no "senior team", "10+ yrs", "industry-leader", "world-class", "cutting-edge", "next-generation", "fortune 500", "award-winning". Replaced with authentic startup voice (passion, curiosity, transparency, continuous learning, customer commitment)
- **Mission & Vision** added (editable in `/app/frontend/src/data/site.js`)
- **Values redesigned**: 8 elegant cards — Innovation, Integrity, Customer Success, Quality Engineering, Transparency, Continuous Learning, Collaboration, Reliability
- **Team page fully redesigned**:
  - Hero "Engineers, designers and builders — united by craft."
  - Philosophy intro ("Our strength isn't measured by years on a resume...")
  - **Leadership** subsection for Thrisha (Founder & CEO) with responsibilities + glow avatar
  - Member grid with initials avatars, expertise pills, hover-reveal responsibilities, social icons
- **New team roster**: Thrisha (CEO, Founder & Founding Engineer), Kavya (Full Stack Developer), Mallikaarjun (AI & Autonomous Systems Engineer), Lalith (Data Engineer & Automation Architect), **Chandana** (Creative Head — replaced Pavan), Venu (CMO), **Anusha** (Software Developer — new)
- Chatbot system prompt updated with the new team + explicit honesty rules

### v4 — Final refinement sprint
- **Navigation simplified**: 8 desktop links in this order — Home, About, Services, Technologies, Process, Team, Portfolio, Contact. Careers + FAQ moved into Footer.
- **Home**: TeamTeaser section removed; the team is now only on the dedicated `/team` page. Final CTA email updated.
- **Portfolio**: all fake project titles removed; cards now show only service-category tags + "Case study in progress" + "Coming Soon" badge.
- **Contact emails** consolidated to `support@dortxtech.com` (general) and `thrisha@dortxtech.com` (founder) — used consistently across Contact, Footer and Home CTA.
- **Technologies** updated to the official DortX stack (7 groups).
- **Footer redesigned**: newsletter signup form, 5 social icons (Instagram, LinkedIn, Facebook, X, YouTube — GitHub removed).
- **Chatbot**: DortX logo now appears in the chat header; friendly fallback.
- **New backend endpoints**: `POST /api/newsletter/subscribe`, admin newsletter list/delete. Analytics exposes a `subscribers` count.
- **Admin Dashboard**: tabs for **Leads / Applications / Newsletter / Analytics**.
- Backend **27/27 passing**, Frontend critical flows **100%**.

### v5 — Brand & CMS polish
- **Native vector logo**: rebuilt entirely in SVG + CSS — DX symbol (silver D + electric-blue X) + "DortX" wordmark with the X in blue + optional small uppercase tagline ("EMPOWERING BUSINESS THROUGH TECHNOLOGY", with the last word in blue). No image asset, no rectangle, no padding, no `mix-blend-mode` workarounds. Used in Navbar (compact), Footer / AdminLogin (with tagline), Admin Dashboard, Chatbot header. Component supports `height`, `withTagline`, `linkTo`, `mono`.
- **Industries section redesigned** as premium icon cards (5-column grid, glassmorphism, spotlight hover, staggered reveal) — 29 official industries + a distinct animated **"Many More…"** card. Headline changed to **"Industries we empower."** with the new subtitle.
- **Team page now reads from backend**: new MongoDB collection `team_members`, seeded with all 7 current members on startup. `GET /api/team` (public) drives the page; the constant `TEAM` was removed.
- **Admin Team Editor**: a new **Team** tab in `/admin` with full CRUD — add / edit / delete members, drag-friendly `order` field, leadership toggle (crown badge), responsibilities list editor, photo upload (drag-and-drop or paste URL → photos served from `/api/uploads/team/{file}`).
- **New backend endpoints**: `GET /api/team` (public), `GET|POST /api/admin/team`, `PATCH|DELETE /api/admin/team/{id}`, `POST /api/admin/team/upload-photo`, `GET /api/uploads/team/{fid}` (static photo serve).
- Backend CRUD verified end-to-end via curl. Frontend Team page + Admin tab compile cleanly.

## Prioritized Backlog
### P1
- Real client testimonials & case studies when first engagements ship (Portfolio currently shows "Coming Soon" by design)
- Email notifications on new lead / application (SendGrid or Resend)
- Per-service detail pages (e.g., `/services/software-development`)
- Convert chatbot UI to SSE streaming

### P2
- Blog / Insights CMS, multi-language, client portal, payment gateway, human handoff from chat, multi-admin invitation flow

## Key Files
- `/app/backend/server.py` — single-file FastAPI app
- `/app/backend/.env` — `EMERGENT_LLM_KEY`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `/app/frontend/src/data/site.js` — **all editable content** (wings, team, FAQs, mission, vision, values, tech, process)
- `/app/frontend/src/components/{Logo,Navbar,Footer,Chatbot,MagneticButton,SectionHeader}.jsx`
- `/app/frontend/src/pages/{Home,About,Services,Portfolio,Process,Technologies,Team,Careers,FAQ,Contact,NotFound}.jsx`
- `/app/frontend/src/pages/admin/{AdminLogin,AdminDashboard}.jsx`
- `/app/memory/test_credentials.md` — admin credentials & API reference
