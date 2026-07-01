"""DortX Backend - FastAPI + MongoDB + JWT + OpenAI chatbot."""
import asyncio
import json
import os
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse, FileResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import bcrypt
import jwt as pyjwt
from openai import AsyncOpenAI

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
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
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
    subject: Optional[str] = Field(None, max_length=200)
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
    visitor_name: Optional[str] = None
    selected_service: Optional[str] = None
    history: List[Dict[str, str]] = Field(default_factory=list)


class ChatLeadCreate(BaseModel):
    session_id: str
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    requirements: str = Field(..., min_length=10, max_length=5000)
    company: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=30)
    country: Optional[str] = Field(None, max_length=100)
    budget: Optional[str] = Field(None, max_length=50)
    project_type: Optional[str] = Field(None, max_length=100)
    timeline: Optional[str] = Field(None, max_length=100)
    preferred_contact_method: Optional[str] = Field(None, max_length=80)


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
    {"name": "Thrisha J C", "role": "Founder & CEO | Founding Engineer", "leadership": True,
     "bio": "Founded DortX with a conviction that small, focused teams can deliver software that actually changes how a business runs. Sets the company's vision and stays close to every line of architecture.",
     "expertise": "Engineering Leadership | Product Strategy | System Architecture",
     "responsibilities": ["Company vision", "Technical architecture", "Software engineering", "Product strategy"],
     "photo": "/team/thrisha.jpeg",
     "linkedin": "https://www.linkedin.com/in/thrishajc05", "email_address": "thrisha@dortxtech.com", "order": 0},
    {"name": "Venu P K", "role": "Co-Founder | Chief Marketing Officer", "leadership": False,
     "bio": "Owns brand, growth and go-to-market at DortX - making sure the businesses we can help the most actually find us, understand us and choose to work with us.",
     "expertise": "Brand & Growth Marketing",
     "responsibilities": ["Digital growth", "Marketing strategy", "SEO", "Performance marketing", "Brand development"],
     "photo": "/team/venu-pk.jpeg",
     "linkedin": "https://www.linkedin.com/in/venupk", "order": 1},
    {"name": "Mallikarjun", "role": "Chief Technology Officer (CTO) | AI & Autonomous Systems Engineer", "leadership": False,
     "bio": "Designs and ships AI agents, automation workflows and machine-learning systems that move from notebooks into real production environments - measured by outcomes, not demos.",
     "expertise": "AI Engineering | Agentic Systems",
     "responsibilities": ["AI solutions", "AI agents", "Automation", "Machine learning"],
     "photo": "/team/mallikaarjun.jpeg",
     "linkedin": "https://www.linkedin.com/in/mallikarjun25", "order": 2},
    {"name": "Lalith S", "role": "Chief Product Officer (CPO) | Data Engineer & Automation Architect", "leadership": False,
     "bio": "Designs the data pipelines, warehouses and automation flows that turn scattered information into clear, dependable signals for the business.",
     "expertise": "Data Engineering | BI | Workflow Automation",
     "responsibilities": ["Data engineering", "Analytics", "Business intelligence", "Workflow automation"],
     "photo": "/team/lalith-s.jpeg",
     "linkedin": "https://www.linkedin.com/in/lalithanju", "order": 3},
    {"name": "Anusha R", "role": "Software Developer", "leadership": False,
     "bio": "Works across application features, quality and testing - focused on shipping software that's not just functional, but genuinely pleasant for the people using it.",
     "expertise": "Application Development | Quality",
     "responsibilities": ["Software development", "Application features", "Quality improvements", "Testing support"],
     "photo": "/team/anusha-r.jpeg",
     "linkedin": "https://www.linkedin.com/in/anusha-r-a82307260", "order": 4},
    {"name": "Chandana", "role": "Creative Head", "leadership": False,
     "bio": "Shapes the visual and experiential identity of DortX - translating product strategy into interfaces, brand systems and design language people connect with.",
     "expertise": "Product Design | Brand Identity",
     "responsibilities": ["UI/UX design", "Brand identity", "Visual design", "Creative direction"],
     "photo": "/team/chandana.jpeg",
     "linkedin": "https://www.linkedin.com/in/chandana-39379636b/", "order": 5},
    {"name": "Kavyashree", "role": "Full Stack Developer", "leadership": False,
     "bio": "Builds end-to-end web and mobile experiences - from clean, accessible interfaces to dependable APIs. Cares deeply about details that users never notice and developers always do.",
     "expertise": "Web & Mobile Development",
     "responsibilities": ["Frontend development", "Backend development", "API integration", "Application development"],
     "photo": "/team/kavyashree.jpeg",
     "linkedin": "https://www.linkedin.com/in/kavyashree2005", "order": 6},
]

TEAM_PROFILE_UPDATES = {
    "Venu P K": {"linkedin": "https://www.linkedin.com/in/venupk"},
}


def apply_team_profile_updates(items: List[dict]) -> List[dict]:
    for item in items:
        updates = TEAM_PROFILE_UPDATES.get(item.get("name"))
        if updates:
            item.update(updates)
    return items

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
        docs = [{**m, "id": str(uuid.uuid4()),
                 "linkedin": m.get("linkedin"), "email_address": m.get("email_address"),
                 "created_at": now_iso(), "updated_at": now_iso()} for m in SEED_TEAM]
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
    logger.info(f"New lead: {lead.email} - {lead.subject or lead.service or 'Contact form'}")
    return lead


@api.post("/leads/with-file", response_model=Lead, status_code=201)
async def create_lead_with_file(
    name: str = Form(...),
    email: str = Form(...),
    description: str = Form(...),
    company: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
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
        phone=phone, subject=subject, service=service, budget=budget, timeline=timeline,
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
    return {"items": apply_team_profile_updates(items)}


@api.get("/admin/team")
async def list_team_admin(admin: dict = Depends(get_current_admin)):
    items = await db.team_members.find({}, {"_id": 0}).sort("order", 1).to_list(length=200)
    return {"items": apply_team_profile_updates(items)}


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


@api.post("/chat/lead", status_code=201)
async def create_chat_lead(payload: ChatLeadCreate):
    details = [
        f"Country: {payload.country or 'Not provided'}",
        f"Project Type: {payload.project_type or 'Not provided'}",
        f"Preferred Contact: {payload.preferred_contact_method or 'Not provided'}",
        "",
        "Requirements:",
        payload.requirements,
    ]
    lead = Lead(
        name=payload.name,
        company=payload.company,
        email=payload.email,
        phone=payload.phone,
        subject="AI chat qualified lead",
        service=payload.project_type,
        budget=payload.budget,
        timeline=payload.timeline,
        description="\n".join(details),
    )
    await db.leads.insert_one(lead.model_dump())
    await db.chat_messages.insert_one({
        "session_id": payload.session_id,
        "role": "system",
        "content": f"Lead captured: {lead.email}",
        "created_at": now_iso(),
        "lead_id": lead.id,
    })
    logger.info(f"New chat lead: {lead.email} - {lead.service or 'Project'}")
    return {"success": True, "id": lead.id}


# --- AI Chatbot (DortX AI) ---
DORTX_SYSTEM = """You are DortX AI, the friendly and professional virtual assistant of DortX.

About DortX:
- Tagline: "Empowering Business Through Technology"
- Contact: support@dortxtech.com, founder thrisha@dortxtech.com, phone +91 81509 90329.
- Philosophy: We do not sell technology. We solve business problems using intelligent technology.
- DortX helps businesses digitally transform through AI, software engineering, automation, data intelligence and digital growth, IoT and industrial automation.

Our 6 Service Wings:
1. Software Development â€” Websites, Web Apps, Mobile Apps, UI/UX Design, Custom ERP/CRM/HRMS, Cloud & DevOps.
2. Cognitive Automation & AI â€” AI Chatbots & Agents, Workflow Automation, Custom AI Applications, AI Integration.
3. Data Intelligence â€” BI Dashboards, Data Analytics, Predictive Analytics, Reporting & Visualization.
4. Strategic Growth - SEO, Performance Marketing, Growth Analytics, Brand Transformation.
5. IoT & Industrial Automation - Industrial IoT, Smart Factory Solutions, Machine Monitoring, Predictive Maintenance, PLC Programming, SCADA, HMI, Embedded Systems, Robotics, Custom Firmware, Sensor Integration, PCB Design and Hardware Integration.
6. Continuity & Security - App Maintenance, Cybersecurity, Technical Support, Performance Optimization.

Our Process: Requirement Analysis â†’ Planning â†’ UI/UX â†’ Development â†’ Testing â†’ Deployment â†’ Maintenance.

Technologies we use: React, Next.js, TypeScript, Tailwind, Node.js, Java Spring Boot, Python, FastAPI, MongoDB, MySQL, PostgreSQL, AWS, Azure, GCP, Docker, Kubernetes, OpenAI, Claude, Gemini, LangChain, Arduino, ESP32, STM32, Raspberry Pi, PLC, SCADA, HMI, MQTT, Modbus, OPC UA, industrial sensors, edge computing and more.

Team Members (current):
- Thrisha J C - Founder & CEO | Founding Engineer
- Venu P K - Co-Founder | Chief Marketing Officer
- Mallikarjun - Chief Technology Officer (CTO) | AI & Autonomous Systems Engineer
- Lalith S - Chief Product Officer (CPO) | Data Engineer & Automation Architect
- Anusha R - Software Developer
- Chandana - Creative Head
- Kavyashree - Full Stack Developer
Assistant behavior:
- Behave like an experienced AI business consultant, not a scripted FAQ bot.
- Keep conversational memory from the current session and refer to the visitor by name when known.
- Ask one clear follow-up question when the next step is ambiguous.
- Use Markdown, bullets, short tables and code blocks when helpful.
- Help with DortX, services, portfolio, technologies, pricing guidance, process, AI, automation, IoT, industrial automation, embedded systems, robotics, hardware, software engineering, web/mobile/cloud, APIs, CRM, ERP, SaaS, business consulting, security and digital transformation.
- When buying intent appears, help qualify the project naturally: name, company, email, phone, country, budget, project type, timeline, requirements, preferred contact method.
- Recommend DortX services when relevant, but do not be pushy.

Tone & honesty rules:
- DortX is a young, focused technology company â€” do not invent years of experience, client lists, awards or fake statistics.
- Speak with warmth and clarity, never marketing buzzwords like "cutting-edge", "world-class", "revolutionary".
- Be concise by default, but give detailed step-by-step answers when the visitor asks for depth.
- If asked about pricing or timelines, explain it depends on scope and politely guide the visitor to the Contact page.
- If asked something outside DortX context, answer briefly if it is a general software/business topic, then connect it back to how DortX can help.
- End answers about services with a soft CTA like: "Want a tailored proposal? Visit our Contact page." when appropriate.
"""


def ai_service_configured() -> bool:
    key = (OPENAI_API_KEY or "").strip().lower()
    return bool(key) and key not in {"dummy-key", "dummy", "changeme", "change-me", "test"}


def sse_data(text: str) -> str:
    return f"data: {json.dumps(text)}\n\n"


async def recent_chat_context(session_id: str, limit: int = 10) -> List[Dict[str, str]]:
    try:
        cursor = db.chat_messages.find(
            {"session_id": session_id},
            {"_id": 0, "role": 1, "content": 1},
        ).sort("created_at", -1).limit(limit)
        rows = await cursor.to_list(length=limit)
        return list(reversed(rows))
    except Exception:
        logger.exception("Could not load chat history")
        return []


def compact_history(history: List[Dict[str, str]], limit: int = 8) -> str:
    cleaned = []
    for item in (history or [])[-limit:]:
        role = str(item.get("role", ""))[:20]
        content = str(item.get("content", "")).strip()
        if role in {"user", "assistant"} and content:
            cleaned.append(f"{role}: {content[:900]}")
    return "\n".join(cleaned)


def build_user_prompt(req: ChatRequest, stored_history: List[Dict[str, str]]) -> str:
    context_lines = []
    if req.visitor_name:
        context_lines.append(f"Visitor name: {req.visitor_name}")
    if req.selected_service:
        context_lines.append(f"Selected service interest: {req.selected_service}")
    merged_history = compact_history(stored_history + (req.history or []), limit=10)
    if merged_history:
        context_lines.append("Recent conversation:\n" + merged_history)
    context = "\n\n".join(context_lines)
    if context:
        return f"{context}\n\nVisitor's latest message:\n{req.message}"
    return req.message


def local_dortx_reply(message: str, visitor_name: Optional[str] = None, selected_service: Optional[str] = None) -> str:
    """Useful deterministic DortX consultant fallback when the external AI provider is unavailable."""
    text = (message or "").lower()
    name_part = f"{visitor_name}, " if visitor_name else ""
    service_hint = f"\n\nSince you're interested in **{selected_service}**, I can tailor the next steps around that." if selected_service else ""

    if any(word in text for word in ["contact", "email", "phone", "call", "reach"]):
        return (
            f"{name_part}you can reach DortX here:\n\n"
            "- **Project enquiries:** support@dortxtech.com\n"
            "- **Founder:** thrisha@dortxtech.com\n"
            "- **Phone:** +91 81509 90329\n\n"
            "If you share your project type, timeline and budget range, I can help you prepare a crisp enquiry before you contact the team."
        )
    if any(word in text for word in ["price", "pricing", "cost", "budget", "quote", "proposal"]):
        return (
            f"{name_part}pricing depends on scope, complexity, integrations and delivery timeline. As a practical guide:\n\n"
            "| Project type | What affects cost |\n"
            "|---|---|\n"
            "| Website | pages, animations, CMS, content, SEO |\n"
            "| Web/mobile app | roles, workflows, dashboards, APIs |\n"
            "| AI agent/chatbot | knowledge sources, integrations, guardrails, analytics |\n"
            "| Automation | systems involved, approvals, error handling |\n\n"
            "The best next step is a short discovery call so DortX can estimate accurately instead of guessing."
        )
    if any(word in text for word in ["portfolio", "case stud", "work", "project"]):
        return (
            f"{name_part}DortX presents portfolio work honestly as launch work and selected case studies. We do not invent client lists or inflated metrics.\n\n"
            "If you tell me the kind of solution you want to build, I can map it to the closest DortX service wing and explain what a similar delivery plan would look like."
        )
    if any(word in text for word in ["process", "timeline", "how do you work", "delivery"]):
        return (
            f"{name_part}DortX usually works in this flow:\n\n"
            "1. **Requirement analysis** - clarify the business goal and users.\n"
            "2. **Planning** - scope, milestones, architecture and risks.\n"
            "3. **UI/UX** - screens, flows and interaction details.\n"
            "4. **Development** - frontend, backend, AI, integrations or automation.\n"
            "5. **Testing** - functional, responsive, performance and security checks.\n"
            "6. **Deployment** - cloud setup, release and monitoring.\n"
            "7. **Maintenance** - improvements, support and scaling.\n\n"
            "Timelines depend on scope, but the team keeps milestones transparent."
        )
    if any(word in text for word in ["technology", "technologies", "stack", "react", "python", "java", "cloud"]):
        return (
            f"{name_part}DortX chooses technology around the business problem, not trends. Common stacks include:\n\n"
            "- **Frontend:** React, Next.js, TypeScript, Tailwind\n"
            "- **Backend:** Python/FastAPI, Node.js, Java Spring Boot\n"
            "- **Data:** MongoDB, MySQL, PostgreSQL, BI dashboards\n"
            "- **Cloud/DevOps:** AWS, Azure, GCP, Docker, Kubernetes\n"
            "- **AI:** OpenAI, Claude, Gemini, LangChain, agent workflows\n"
            "- **IoT/Industrial:** Arduino, ESP32, STM32, Raspberry Pi, PLC, SCADA, HMI, MQTT, Modbus, OPC UA, industrial sensors and edge computing\n\n"
            "If you share your target platform and users, I can suggest a sensible architecture."
        )
    if any(word in text for word in ["iot", "iiot", "industrial", "plc", "scada", "hmi", "arduino", "esp32", "stm32", "raspberry", "robot", "robotics", "sensor", "pcb", "mqtt", "modbus", "opc", "machine monitoring", "predictive maintenance", "smart factory"]):
        return (
            f"{name_part}yes. DortX can help with **IoT and industrial automation** solutions that connect devices, machines and business systems.\n\n"
            "Typical capabilities include:\n\n"
            "- Industrial IoT and smart factory systems\n"
            "- Machine monitoring, predictive maintenance and energy monitoring\n"
            "- PLC programming, SCADA, HMI and process automation\n"
            "- Embedded systems with Arduino, ESP32, STM32 and Raspberry Pi\n"
            "- Sensor integration, custom firmware, smart devices and robotics\n"
            "- PCB design, prototypes and hardware integration\n\n"
            "The business value is usually reduced downtime, real-time visibility, better operational efficiency and scalable industrial systems."
        )
    if any(word in text for word in ["ai", "automation", "agent", "chatbot", "workflow"]):
        return (
            f"{name_part}yes. DortX can help with **AI agents, AI chatbots, workflow automation, custom AI applications and integrations**.\n\n"
            "A production AI solution should usually include:\n\n"
            "- a clear business outcome\n"
            "- trusted knowledge sources\n"
            "- tool/API integrations\n"
            "- guardrails and escalation paths\n"
            "- analytics and continuous improvement\n\n"
            f"The goal is practical automation that reaches production, not just a demo.{service_hint}"
        )
    if any(word in text for word in ["software", "website", "app", "mobile", "erp", "crm", "development"]):
        return (
            f"{name_part}DortX builds websites, web apps, mobile apps, UI/UX systems, internal tools and custom ERP/CRM/HRMS platforms.\n\n"
            "A good starting point is to define:\n\n"
            "- who will use it\n"
            "- what workflow it improves\n"
            "- what systems it must connect to\n"
            "- what success should look like after launch\n\n"
            "Share those details and I can help shape the first scope."
        )
    if any(word in text for word in ["service", "offer", "do you do", "what do you"]):
        return (
            f"{name_part}DortX has six service wings:\n\n"
            "1. **Software Development** - websites, apps, ERP/CRM/HRMS, UI/UX, cloud.\n"
            "2. **Cognitive Automation & AI** - AI agents, chatbots, workflow automation, AI integrations.\n"
            "3. **Data Intelligence** - dashboards, analytics, reporting, predictive insights.\n"
            "4. **Strategic Growth** - SEO, performance marketing, growth analytics, brand transformation.\n"
            "5. **IoT & Industrial Automation** - IIoT, smart factories, PLC/SCADA/HMI, embedded systems, robotics and hardware prototypes.\n"
            "6. **Continuity & Security** - maintenance, cybersecurity, support and optimization.\n\n"
            "Tell me what you are trying to improve, and I will point you to the right path."
        )
    return (
        f"{name_part}DortX helps businesses solve problems with intelligent technology across software development, AI and automation, data intelligence, digital growth, IoT and industrial automation, and ongoing support.\n\n"
        "Tell me what you are trying to build, automate or improve. I can help you think through the solution, likely technology choices, timeline considerations and the right DortX service wing."
    )


@api.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """Server-Sent Events stream for the DortX AI chatbot."""
    stored_history = await recent_chat_context(req.session_id)
    if not ai_service_configured():
        reply = local_dortx_reply(req.message, req.visitor_name, req.selected_service)
        await db.chat_messages.insert_one({
            "session_id": req.session_id,
            "role": "user",
            "content": req.message,
            "created_at": now_iso(),
            "visitor_name": req.visitor_name,
            "selected_service": req.selected_service,
        })
        await db.chat_messages.insert_one({
            "session_id": req.session_id,
            "role": "assistant",
            "content": reply,
            "created_at": now_iso(),
            "source": "local_fallback",
        })

        async def fallback_event_gen():
            yield sse_data(reply)
            yield "event: done\ndata: [DONE]\n\n"

        return StreamingResponse(fallback_event_gen(), media_type="text/event-stream")

    openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    prompt = build_user_prompt(req, stored_history)

    # Persist user message
    await db.chat_messages.insert_one({
        "session_id": req.session_id,
        "role": "user",
        "content": req.message,
        "created_at": now_iso(),
        "visitor_name": req.visitor_name,
        "selected_service": req.selected_service,
    })

    async def event_gen():
        full = []
        delivered = False
        try:
            for attempt in range(2):
                try:
                    stream = await openai_client.chat.completions.create(
                        model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                        messages=[
                            {"role": "system", "content": DORTX_SYSTEM},
                            {"role": "user", "content": prompt},
                        ],
                        temperature=0.4,
                        stream=True,
                    )
                    async for chunk in stream:
                        delta = chunk.choices[0].delta.content if chunk.choices else None
                        if delta:
                            delivered = True
                            full.append(delta)
                            yield sse_data(delta)
                    if full:
                        break
                except Exception:
                    logger.exception("Chat stream error on attempt %s", attempt + 1)
                    if attempt == 0 and not delivered:
                        await asyncio.sleep(0.8)
                        continue
                    break
            if not full:
                fallback = local_dortx_reply(req.message, req.visitor_name, req.selected_service)
                full.append(fallback)
                yield sse_data(fallback)
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
    stored_history = await recent_chat_context(req.session_id)
    if not ai_service_configured():
        reply = local_dortx_reply(req.message, req.visitor_name, req.selected_service)
        await db.chat_messages.insert_one({
            "session_id": req.session_id, "role": "user", "content": req.message, "created_at": now_iso(),
            "visitor_name": req.visitor_name, "selected_service": req.selected_service,
        })
        await db.chat_messages.insert_one({
            "session_id": req.session_id, "role": "assistant", "content": reply, "created_at": now_iso(), "source": "local_fallback",
        })
        return {"reply": reply, "source": "local_fallback"}

    openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    prompt = build_user_prompt(req, stored_history)

    await db.chat_messages.insert_one({
        "session_id": req.session_id, "role": "user", "content": req.message, "created_at": now_iso(),
        "visitor_name": req.visitor_name, "selected_service": req.selected_service,
    })
    parts = []
    for attempt in range(2):
        try:
            async def collect_reply():
                stream = await openai_client.chat.completions.create(
                    model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                    messages=[
                        {"role": "system", "content": DORTX_SYSTEM},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.4,
                    stream=True,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        parts.append(delta)
            await asyncio.wait_for(collect_reply(), timeout=40)
            if parts:
                break
        except Exception:
            logger.exception("Chat sync error on attempt %s", attempt + 1)
            if attempt == 0:
                await asyncio.sleep(0.8)
                continue
    if not parts:
        reply = local_dortx_reply(req.message, req.visitor_name, req.selected_service)
        await db.chat_messages.insert_one({
            "session_id": req.session_id, "role": "assistant", "content": reply, "created_at": now_iso(), "source": "local_fallback",
        })
        return {"reply": reply, "source": "local_fallback"}
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

