"""DortX backend API regression tests (pytest)."""
import io
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://dortx-backend.onrender.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "thrisha@dortxtech.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "change-this-password")


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# --- Health ---
class TestHealth:
    def test_health(self):
        r = requests.get(f"{API}/health", timeout=10)
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"


# --- Leads ---
class TestLeads:
    def test_create_lead_happy(self):
        payload = {
            "name": "TEST Lead User",
            "email": "test_lead@example.com",
            "description": "We need an AI chatbot for our website.",
            "company": "TestCo",
            "service": "AI",
        }
        r = requests.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["email"] == payload["email"]
        assert data["name"] == payload["name"]
        assert data["status"] == "new"
        assert "id" in data
        pytest.created_lead_id = data["id"]

    def test_create_lead_validation_email(self):
        r = requests.post(f"{API}/leads", json={"name": "X", "email": "not-an-email", "description": "short"}, timeout=10)
        assert r.status_code == 422

    def test_create_lead_validation_desc(self):
        r = requests.post(f"{API}/leads", json={"name": "TestUser", "email": "a@b.com", "description": "tiny"}, timeout=10)
        assert r.status_code == 422

    def test_create_lead_with_file(self):
        files = {"file": ("hello.txt", io.BytesIO(b"hello"), "text/plain")}
        data = {
            "name": "TEST Upload User",
            "email": "test_upload@example.com",
            "description": "Lead with attached doc for review.",
            "company": "FileCo",
        }
        r = requests.post(f"{API}/leads/with-file", data=data, files=files, timeout=20)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["file_name"] == "hello.txt"
        assert body["email"] == data["email"]


# --- Careers ---
class TestCareers:
    def test_apply_career_happy(self):
        payload = {
            "name": "TEST Candidate",
            "email": "test_candidate@example.com",
            "phone": "+1234567890",
            "position": "Full Stack Engineer",
            "experience": "3 years",
            "portfolio": "https://example.com",
            "cover_letter": "I am excited to apply for this role and contribute meaningfully.",
        }
        r = requests.post(f"{API}/careers/apply", json=payload, timeout=15)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["success"] is True
        assert "id" in body

    def test_apply_career_validation(self):
        r = requests.post(f"{API}/careers/apply", json={"name": "X", "email": "bad", "position": "p", "cover_letter": "short"}, timeout=10)
        assert r.status_code == 422


# --- Auth ---
class TestAuth:
    def test_login_good(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        assert body["email"] == ADMIN_EMAIL

    def test_login_bad(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=10)
        assert r.status_code == 401

    def test_admin_requires_auth(self):
        r = requests.get(f"{API}/admin/leads", timeout=10)
        assert r.status_code == 401


# --- Admin ---
class TestAdmin:
    def test_list_leads(self, auth_headers):
        r = requests.get(f"{API}/admin/leads?page=1&limit=10", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert "items" in body and isinstance(body["items"], list)
        assert "total" in body
        assert body["page"] == 1

    def test_list_leads_with_query(self, auth_headers):
        r = requests.get(f"{API}/admin/leads?q=TEST&status=new", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body["items"], list)

    def test_analytics(self, auth_headers):
        r = requests.get(f"{API}/admin/analytics", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert "total_leads" in body
        assert "by_status" in body
        assert "by_service" in body
        assert "applications" in body

    def test_export_csv(self, auth_headers):
        r = requests.get(f"{API}/admin/leads/export.csv", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        assert b"id,name,email" in r.content[:100]

    def test_update_lead_status(self, auth_headers):
        # Create a lead first
        payload = {"name": "TEST Status User", "email": "test_status@example.com", "description": "Status update test ........"}
        r = requests.post(f"{API}/leads", json=payload, timeout=10)
        lead_id = r.json()["id"]
        # Update status
        r2 = requests.patch(f"{API}/admin/leads/{lead_id}/status", json={"status": "contacted"}, headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        # Verify persisted
        r3 = requests.get(f"{API}/admin/leads?q=test_status", headers=auth_headers, timeout=10)
        items = r3.json()["items"]
        found = next((x for x in items if x["id"] == lead_id), None)
        assert found is not None
        assert found["status"] == "contacted"

    def test_update_status_invalid(self, auth_headers):
        payload = {"name": "TEST Inv", "email": "test_inv@example.com", "description": "blah blah blah blah blah blah"}
        r = requests.post(f"{API}/leads", json=payload, timeout=10)
        lid = r.json()["id"]
        r2 = requests.patch(f"{API}/admin/leads/{lid}/status", json={"status": "garbage"}, headers=auth_headers, timeout=10)
        assert r2.status_code == 400

    def test_delete_lead(self, auth_headers):
        # Create
        r = requests.post(f"{API}/leads", json={"name": "TEST Del", "email": "test_del@example.com", "description": "delete me delete me delete me"}, timeout=10)
        lid = r.json()["id"]
        # Delete
        r2 = requests.delete(f"{API}/admin/leads/{lid}", headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["success"] is True
        # Verify gone (second delete should 404)
        r3 = requests.delete(f"{API}/admin/leads/{lid}", headers=auth_headers, timeout=10)
        assert r3.status_code == 404

    def test_delete_lead_not_found(self, auth_headers):
        r = requests.delete(f"{API}/admin/leads/{uuid.uuid4()}", headers=auth_headers, timeout=10)
        assert r.status_code == 404


# --- Chatbot ---
class TestChat:
    def test_chat_reply(self):
        payload = {"session_id": f"test-{uuid.uuid4()}", "message": "What services does DortX offer?"}
        r = requests.post(f"{API}/chat", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "reply" in body
        assert isinstance(body["reply"], str)
        assert len(body["reply"]) > 20


# --- Newsletter ---
class TestNewsletter:
    sub_email = f"test_news_{uuid.uuid4().hex[:8]}@example.com"

    def test_subscribe_new(self):
        r = requests.post(f"{API}/newsletter/subscribe", json={"email": TestNewsletter.sub_email, "source": "footer"}, timeout=10)
        assert r.status_code == 201, r.text
        body = r.json()
        assert body["success"] is True
        assert "id" in body
        TestNewsletter.sub_id = body["id"]

    def test_subscribe_duplicate(self):
        r = requests.post(f"{API}/newsletter/subscribe", json={"email": TestNewsletter.sub_email, "source": "footer"}, timeout=10)
        assert r.status_code in (200, 201)
        body = r.json()
        assert body["success"] is True
        assert body.get("already_subscribed") is True

    def test_subscribe_invalid_email(self):
        r = requests.post(f"{API}/newsletter/subscribe", json={"email": "not-email"}, timeout=10)
        assert r.status_code == 422

    def test_admin_list_newsletter(self, auth_headers):
        r = requests.get(f"{API}/admin/newsletter", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert "items" in body and "total" in body
        emails = [x["email"] for x in body["items"]]
        assert TestNewsletter.sub_email in emails

    def test_admin_newsletter_auth_required(self):
        r = requests.get(f"{API}/admin/newsletter", timeout=10)
        assert r.status_code == 401

    def test_analytics_has_subscribers(self, auth_headers):
        r = requests.get(f"{API}/admin/analytics", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert "subscribers" in body
        assert isinstance(body["subscribers"], int)
        assert body["subscribers"] >= 1

    def test_delete_subscriber(self, auth_headers):
        r = requests.delete(f"{API}/admin/newsletter/{TestNewsletter.sub_id}", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_delete_subscriber_not_found(self, auth_headers):
        r = requests.delete(f"{API}/admin/newsletter/{uuid.uuid4()}", headers=auth_headers, timeout=10)
        assert r.status_code == 404
