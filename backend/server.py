"""DortX Backend - FastAPI + MongoDB + JWT + Claude AI Chatbot."""
import os
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse, FileResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import bcrypt
import jwt as pyjwt
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# --- Config ---
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
JWT_EXPIRE_MINUTES = int(os.environ['JWT_EXPIRE_MINUTES'])
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
UPLOAD_DIR = Path(os.environ['UPLOAD_DIR'])
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# --- DB ---
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# --- App ---
app = FastAPI(title="DortX API", version="1.0.0", description="Official DortX backend API")
api = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("dortx")


# --- Models ---
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    company: Optional[str] = Field(None, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=30)
    service: Optional[str] = Field(None, max_length=100)
    budget: Optional[str] = Field(None, max_length=50)
    description: str = Field(..., min_length=10, max_length=5000)
    timeline: Optional[str] = Field(None, max_length=100)
    file_name: Optional[str] = None
    file_path: Optional[str] = None


class Lead(LeadCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "new"  # new, contacted, qualified, won, lost
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class LeadStatusUpdate(BaseModel):
    status: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class CareerApplication(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    position: str = Field(..., max_length=200)
    experience: Optional[str] = None
    portfolio: Optional[str] = None
    cover_letter: str = Field(..., min_length=20, max_length=5000)


class NewsletterSubscribe(BaseModel):
    email: EmailStr
    source: Optional[str] = "footer"


class TeamMember(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    role: str = Field(..., min_length=1, max_length=120)
    bio: Optional[str] = Field("", max_length=2000)
    expertise: Optional[str] = Field("", max_length=200)
    responsibilities: List[str] = Field(default_factory=list)
    photo: Optional[str] = None
    leadership: bool = False
    linkedin: Optional[str] = None
    email_address: Optional[str] = None
    order: int = 0


class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    photo: Optional[str] = None
    leadership: Optional[bool] = None
    linkedin: Optional[str] = None
    email_address: Optional[str] = None
    order: Optional[int] = None


# --- Auth helpers ---
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(email: str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
    except pyjwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    admin = await db.admins.find_one({"email": email}, {"_id": 0, "password": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin


SEED_TEAM = [
    {"name": "Thrisha", "role": "CEO, Founder & Founding Engineer", "leadership": True,
     "bio": "Founded DortX with a conviction that small, focused teams can deliver software that actually changes how a business runs. Sets the company's vision and stays close to every line of architecture.",
     "expertise": "Engineering Leadership · Product Strategy · System Architecture",
     "responsibilities": ["Company vision", "Technical architecture", "Software engineering", "Product strategy"], "order": 0},
    {"name": "Kavya", "role": "Full Stack Developer", "leadership": False,
     "bio": "Builds end-to-end web and mobile experiences — from clean, accessible interfaces to dependable APIs. Cares deeply about details that users never notice and developers always do.",
     "expertise": "Web & Mobile Development",
     "responsibilities": ["Frontend development", "Backend development", "API integration", "Application development"], "order": 1},
    {"name": "Mallikaarjun", "role": "AI & Autonomous Systems Engineer", "leadership": False,
     "bio": "Designs and ships AI agents, automation workflows and machine-learning systems that move from notebooks into real production environments — measured by outcomes, not demos.",
     "expertise": "AI Engineering · Agentic Systems",
     "responsibilities": ["AI solutions", "AI agents", "Automation", "Machine learning"], "order": 2},
    {"name": "Lalith", "role": "Data Engineer & Automation Architect", "leadership": False,
     "bio": "Designs the data pipelines, warehouses and automation flows that turn scattered information into clear, dependable signals for the business.",
     "expertise": "Data Engineering · BI · Workflow Automation",
     "responsibilities": ["Data engineering", "Analytics", "Business intelligence", "Workflow automation"], "order": 3},
    {"name": "Chandana", "role": "Creative Head", "leadership": False,
     "bio": "Shapes the visual and experiential identity of DortX — translating product strategy into interfaces, brand systems and design language people connect with.",
     "expertise": "Product Design · Brand Identity",
     "responsibilities": ["UI/UX design", "Brand identity", "Visual design", "Creative direction"], "order": 4},
    {"name": "Venu", "role": "Chief Marketing Officer", "leadership": False,
     "bio": "Owns brand, growth and go-to-market at DortX — making sure the businesses we can help the most actually find us, understand us and choose to work with us.",
     "expertise": "Brand & Growth Marketing",
     "responsibilities": ["Digital growth", "Marketing strategy", "SEO", "Performance marketing", "Brand development"], "order": 5},
    {"name": "Anusha", "role": "Software Developer", "leadership": False,
     "bio": "Works across application features, quality and testing — focused on shipping software that's not just functional, but genuinely pleasant for the people using it.",
     "expertise": "Application Development · Quality",
     "responsibilities": ["Software development", "Application features", "Quality improvements", "Testing support"], "order": 6},
]


# --- Startup: seed admin ---
@app.on_event("startup")
async def startup():
    existing = await db.admins.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password": hash_password(ADMIN_PASSWORD),
            "role": "super_admin",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin: {ADMIN_EMAIL}")
    else:
        if not existing.get("password", "").startswith("$2"):
            await db.admins.update_one({"email": ADMIN_EMAIL}, {"$set": {"password": hash_password(ADMIN_PASSWORD)}})
    # Seed team if empty
    if await db.team_members.count_documents({}) == 0:
        docs = [{**m, "id": str(uuid.uuid4()), "photo": None, "linkedin": None,
                 "email_address": None, "created_at": now_iso(), "updated_at": now_iso()} for m in SEED_TEAM]
        await db.team_members.insert_many(docs)
        logger.info(f"Seeded {len(docs)} team members")


@app.on_event("shutdown")
async def shutdown():
    client.close()


# --- Public Routes ---
@api.get("/")
async def root():
    return {"name": "DortX API", "status": "ok", "version": "1.0.0"}


@api.get("/health")
async def health():
    return {"status": "healthy", "time": now_iso()}


# --- Leads / Contact ---
@api.post("/leads", response_model=Lead, status_code=201)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    await db.leads.insert_one(lead.model_dump())
    logger.info(f"New lead: {lead.email} - {lead.service}")
    return lead


@api.post("/leads/with-file", response_model=Lead, status_code=201)
async def create_lead_with_file(
    name: str = Form(...),
    email: str = Form(...),
    description: str = Form(...),
    company: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    service: Optional[str] = Form(None),
    budget: Optional[str] = Form(None),
    timeline: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    file_name = None
    file_path = None
    if file and file.filename:
        ext = Path(file.filename).suffix
        fid = f"{uuid.uuid4()}{ext}"
        dest = UPLOAD_DIR / fid
        with dest.open("wb") as f:
            f.write(await file.read())
        file_name = file.filename
        file_path = str(dest)

    lead = Lead(
        name=name, email=email, description=description, company=company,
        phone=phone, service=service, budget=budget, timeline=timeline,
        file_name=file_name, file_path=file_path,
    )
    await db.leads.insert_one(lead.model_dump())
    return lead


# --- Career applications ---
@api.post("/careers/apply", status_code=201)
async def apply_career(payload: CareerApplication):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "status": "new",
        "created_at": now_iso(),
    }
    await db.applications.insert_one(doc)
    return {"success": True, "id": doc["id"]}


# --- Newsletter ---
@api.post("/newsletter/subscribe", status_code=201)
async def subscribe_newsletter(payload: NewsletterSubscribe):
    existing = await db.newsletter_subscribers.find_one({"email": payload.email})
    if existing:
        return {"success": True, "already_subscribed": True}
    doc = {
        "id": str(uuid.uuid4()),
        "email": payload.email,
        "source": payload.source or "footer",
        "created_at": now_iso(),
    }
    await db.newsletter_subscribers.insert_one(doc)
    return {"success": True, "id": doc["id"]}


# --- Auth ---
@api.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    admin = await db.admins.find_one({"email": payload.email})
    if not admin or not verify_password(payload.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(admin["email"])
    return TokenResponse(access_token=token, email=admin["email"])


@api.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


# --- Admin routes ---
@api.get("/admin/leads")
async def list_leads(
    admin: dict = Depends(get_current_admin),
    q: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
):
    query: dict = {}
    if status and status != "all":
        query["status"] = status
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"company": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    total = await db.leads.count_documents(query)
    cursor = db.leads.find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items, "total": total, "page": page, "limit": limit}


@api.patch("/admin/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, payload: LeadStatusUpdate, admin: dict = Depends(get_current_admin)):
    if payload.status not in ("new", "contacted", "qualified", "won", "lost"):
        raise HTTPException(400, "Invalid status")
    res = await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"status": payload.status, "updated_at": now_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Lead not found")
    return {"success": True}


@api.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.leads.delete_one({"id": lead_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Lead not found")
    return {"success": True}


@api.get("/admin/analytics")
async def analytics(admin: dict = Depends(get_current_admin)):
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    by_status = {doc["_id"]: doc["count"] async for doc in db.leads.aggregate(pipeline)}
    total = await db.leads.count_documents({})
    applications = await db.applications.count_documents({})
    # Leads by service
    svc_pipeline = [{"$group": {"_id": "$service", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    by_service = [{"service": d["_id"] or "Unspecified", "count": d["count"]} async for d in db.leads.aggregate(svc_pipeline)]
    subscribers = await db.newsletter_subscribers.count_documents({})
    return {
        "total_leads": total,
        "by_status": by_status,
        "by_service": by_service,
        "applications": applications,
        "subscribers": subscribers,
    }


@api.get("/admin/leads/export.csv")
async def export_leads(admin: dict = Depends(get_current_admin)):
    import io
    import csv
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id", "name", "email", "company", "phone", "service", "budget", "timeline", "status", "description", "created_at"])
    async for d in db.leads.find({}, {"_id": 0}):
        writer.writerow([d.get(k, "") for k in ["id", "name", "email", "company", "phone", "service", "budget", "timeline", "status", "description", "created_at"]])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dortx_leads.csv"},
    )


@api.get("/admin/applications")
async def list_applications(admin: dict = Depends(get_current_admin)):
    items = await db.applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=500)
    return {"items": items}


@api.get("/admin/newsletter")
async def list_newsletter(admin: dict = Depends(get_current_admin)):
    items = await db.newsletter_subscribers.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=2000)
    total = await db.newsletter_subscribers.count_documents({})
    return {"items": items, "total": total}


@api.delete("/admin/newsletter/{sub_id}")
async def delete_subscriber(sub_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.newsletter_subscribers.delete_one({"id": sub_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Subscriber not found")
    return {"success": True}


# --- Team (public + admin) ---
@api.get("/team")
async def list_team_public():
    items = await db.team_members.find({}, {"_id": 0}).sort("order", 1).to_list(length=200)
    return {"items": items}


@api.get("/admin/team")
async def list_team_admin(admin: dict = Depends(get_current_admin)):
    items = await db.team_members.find({}, {"_id": 0}).sort("order", 1).to_list(length=200)
    return {"items": items}


@api.post("/admin/team", status_code=201)
async def create_team_member(payload: TeamMember, admin: dict = Depends(get_current_admin)):
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.team_members.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api.patch("/admin/team/{member_id}")
async def update_team_member(member_id: str, payload: TeamMemberUpdate, admin: dict = Depends(get_current_admin)):
    update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if not update:
        raise HTTPException(400, "No fields to update")
    update["updated_at"] = now_iso()
    res = await db.team_members.update_one({"id": member_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Team member not found")
    doc = await db.team_members.find_one({"id": member_id}, {"_id": 0})
    return doc


@api.delete("/admin/team/{member_id}")
async def delete_team_member(member_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.team_members.delete_one({"id": member_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Team member not found")
    return {"success": True}


@api.post("/admin/team/upload-photo")
async def upload_team_photo(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    if not file or not file.filename:
        raise HTTPException(400, "No file provided")
    team_dir = UPLOAD_DIR / "team"
    team_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename).suffix.lower() or ".jpg"
    fid = f"{uuid.uuid4()}{ext}"
    dest = team_dir / fid
    with dest.open("wb") as f:
        f.write(await file.read())
    # Expose via static-ish endpoint
    return {"url": f"/api/uploads/team/{fid}", "filename": file.filename}


@api.get("/brand/{name}")
async def serve_brand(name: str):
    safe = Path(name).name
    path = UPLOAD_DIR / "brand" / safe
    if not path.exists():
        raise HTTPException(404, "Not found")
    return FileResponse(path)


@api.get("/uploads/team/{fid}")
async def serve_team_photo(fid: str):
    path = UPLOAD_DIR / "team" / fid
    if not path.exists():
        raise HTTPException(404, "Not found")
    return FileResponse(path)


# --- AI Chatbot (DortX AI) ---
DORTX_SYSTEM = """You are DortX AI, the friendly and professional virtual assistant of DortX.

About DortX:
- Tagline: "Empowering Business Through Technology"
- Philosophy: We do not sell technology. We solve business problems using intelligent technology.
- DortX helps businesses digitally transform through AI, software engineering, automation, data intelligence and digital growth.

Our 5 Service Wings:
1. Software Development — Websites, Web Apps, Mobile Apps, UI/UX Design, Custom ERP/CRM/HRMS, Cloud & DevOps.
2. Cognitive Automation & AI — AI Chatbots & Agents, Workflow Automation, Custom AI Applications, AI Integration.
3. Data Intelligence — BI Dashboards, Data Analytics, Predictive Analytics, Reporting & Visualization.
4. Strategic Growth — SEO, Performance Marketing, Growth Analytics, Brand Transformation.
5. Continuity & Security — App Maintenance, Cybersecurity, Technical Support, Performance Optimization.

Our Process: Requirement Analysis → Planning → UI/UX → Development → Testing → Deployment → Maintenance.

Technologies we use: React, Next.js, TypeScript, Tailwind, Node.js, Java Spring Boot, Python, FastAPI, MongoDB, MySQL, PostgreSQL, AWS, Azure, GCP, Docker, Kubernetes, OpenAI, Claude, Gemini, LangChain, and more.

Team Members (current):
- Thrisha — CEO, Founder & Founding Engineer
- Kavya — Full Stack Developer
- Mallikaarjun — AI & Autonomous Systems Engineer
- Lalith — Data Engineer & Automation Architect
- Chandana — Creative Head
- Venu — Chief Marketing Officer
- Anusha — Software Developer

Tone & honesty rules:
- DortX is a young, focused technology company — do not invent years of experience, client lists, awards or fake statistics.
- Speak with warmth and clarity, never marketing buzzwords like "cutting-edge", "world-class", "revolutionary".
- Be concise (2–4 short paragraphs max).
- If asked about pricing or timelines, explain it depends on scope and politely guide the visitor to the Contact page.
- If asked something outside DortX context, gently redirect back to how DortX can help.
- End answers about services with a soft CTA like: "Want a tailored proposal? Visit our Contact page." when appropriate.
"""


@api.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """Server-Sent Events stream for the DortX AI chatbot."""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=DORTX_SYSTEM,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    # Persist user message
    await db.chat_messages.insert_one({
        "session_id": req.session_id,
        "role": "user",
        "content": req.message,
        "created_at": now_iso(),
    })

    async def event_gen():
        full = []
        try:
            async for ev in chat.stream_message(UserMessage(text=req.message)):
                if isinstance(ev, TextDelta):
                    full.append(ev.content)
                    # SSE format
                    yield f"data: {ev.content}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("Chat stream error")
            yield f"data: [Sorry, I had a hiccup. Please try again.]\n\n"
        finally:
            # Persist assistant reply
            await db.chat_messages.insert_one({
                "session_id": req.session_id,
                "role": "assistant",
                "content": "".join(full),
                "created_at": now_iso(),
            })
            yield "event: done\ndata: [DONE]\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@api.post("/chat")
async def chat_sync(req: ChatRequest):
    """Non-streaming fallback (used if SSE blocked)."""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=DORTX_SYSTEM,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    await db.chat_messages.insert_one({
        "session_id": req.session_id, "role": "user", "content": req.message, "created_at": now_iso(),
    })
    parts = []
    try:
        async for ev in chat.stream_message(UserMessage(text=req.message)):
            if isinstance(ev, TextDelta):
                parts.append(ev.content)
            elif isinstance(ev, StreamDone):
                break
    except Exception:
        logger.exception("Chat sync error")
        raise HTTPException(500, "Chat temporarily unavailable")
    reply = "".join(parts)
    await db.chat_messages.insert_one({
        "session_id": req.session_id, "role": "assistant", "content": reply, "created_at": now_iso(),
    })
    return {"reply": reply}


# Register router & middleware
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
