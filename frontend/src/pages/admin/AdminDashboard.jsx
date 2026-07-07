import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Download, LogOut, Trash2, RefreshCw, Users, Mail, Briefcase, Send, LayoutDashboard, Inbox, FileText, UserCog, Activity, Save, FolderKanban, CheckCircle2, ClipboardCheck, Archive, Star, X } from "lucide-react";
import Logo from "@/components/Logo";
import TeamManager from "@/pages/admin/TeamManager";
import { adminApiClient } from "@/config/api";

const LEAD_STATUSES = [
  "new",
  "contacted",
  "requirement_discussion",
  "proposal_generated",
  "proposal_sent",
  "proposal_accepted",
  "agreement_generated",
  "agreement_signed",
  "invoice_generated",
  "advance_paid",
  "project_started",
  "in_progress",
  "delivered",
  "completed",
  "lost",
];
const STATUSES = ["all", ...LEAD_STATUSES];
const STATUS_COLOR = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  requirement_discussion: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  proposal_generated: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  proposal_sent: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  proposal_accepted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  agreement_generated: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  agreement_signed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  invoice_generated: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  advance_paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  project_started: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  in_progress: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  delivered: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  lost: "bg-red-500/15 text-red-300 border-red-500/30",
  not_started: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  testing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  on_hold: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
  reviewing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  shortlisted: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  rejected: "bg-red-500/15 text-red-300 border-red-500/30",
  hired: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};
const EMPTY_STATS = {
  total_leads: 0,
  by_status: {},
  by_service: [],
  applications: 0,
  subscribers: 0,
  current_month_leads: 0,
  previous_month_leads: 0,
  monthly_growth: 0,
};
const EMPTY_LIVE_METRICS = {
  visitors_online: 0,
  active_projects: 0,
  projects_delivered: 0,
};
const COMPLETION_CHECKLIST = [
  ["proposal_approved", "Proposal approved"],
  ["agreement_signed", "Agreement signed"],
  ["advance_payment_received", "Advance payment received"],
  ["final_payment_received", "Final payment received"],
  ["source_code_delivered", "Source code delivered"],
  ["credentials_shared", "Credentials shared"],
  ["documentation_delivered", "Documentation delivered"],
  ["client_approval_received", "Client approval received"],
];
const LEAD_JOURNEY = [
  { status: "new", label: "New Enquiry", fields: [{ key: "notes", label: "Initial notes", type: "textarea" }] },
  { status: "contacted", label: "Contacted", fields: [{ key: "contact_summary", label: "Contact summary", type: "textarea" }, { key: "preferred_contact", label: "Preferred contact", type: "text" }] },
  { status: "requirement_discussion", label: "Requirement Discussion", fields: [{ key: "requirements", label: "Requirements discussed", type: "textarea" }, { key: "timeline", label: "Expected timeline", type: "text" }] },
  { status: "proposal_generated", label: "Proposal Generated", fields: [{ key: "project_name", label: "Project name", type: "text" }, { key: "proposal_scope", label: "Proposal scope", type: "textarea" }, { key: "estimated_price", label: "Estimated price", type: "text" }] },
  { status: "proposal_sent", label: "Proposal Sent", fields: [{ key: "sent_to", label: "Sent to", type: "text" }, { key: "sent_notes", label: "Sending notes", type: "textarea" }] },
  { status: "proposal_accepted", label: "Proposal Accepted", fields: [{ key: "acceptance_notes", label: "Acceptance notes", type: "textarea" }] },
  { status: "agreement_generated", label: "Agreement Generated", fields: [{ key: "agreement_scope", label: "Agreement scope", type: "textarea" }, { key: "support_period", label: "Support period", type: "text" }] },
  { status: "agreement_signed", label: "Agreement Signed", fields: [{ key: "signed_by", label: "Signed by", type: "text" }, { key: "signature_notes", label: "Signature notes", type: "textarea" }] },
  { status: "advance_paid", label: "Advance Payment Received", fields: [{ key: "amount", label: "Amount received", type: "text" }, { key: "payment_mode", label: "Payment mode", type: "text" }, { key: "transaction_id", label: "Transaction ID", type: "text" }] },
  { status: "project_started", label: "Convert to Project", fields: [{ key: "project_name", label: "Project name", type: "text" }, { key: "project_notes", label: "Project kickoff notes", type: "textarea" }] },
];

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function toMetricNumber(value) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? next : 0;
}

function readListResponse(response, name, { paginated = false, keys = [] } = {}) {
  const data = response?.data;
  const nested = data?.data && typeof data.data === "object" ? data.data : null;
  const candidates = [
    data?.items,
    nested?.items,
    ...keys.map((key) => data?.[key]),
    ...keys.map((key) => nested?.[key]),
  ];
  const items = candidates.find(Array.isArray);
  if (!Array.isArray(items)) {
    throw new Error(`${name} response must include an items array`);
  }
  return {
    items,
    total: paginated ? toNumber(data?.total ?? nested?.total, items.length) : toNumber(data?.total ?? nested?.total, items.length),
  };
}

function readAnalyticsResponse(response) {
  const data = response?.data;
  if (!data || typeof data !== "object") {
    throw new Error("Analytics response must be an object");
  }

  return {
    total_leads: toNumber(data.total_leads),
    by_status: data.by_status && typeof data.by_status === "object" && !Array.isArray(data.by_status) ? data.by_status : {},
    by_service: Array.isArray(data.by_service) ? data.by_service : [],
    applications: toNumber(data.applications),
    subscribers: toNumber(data.subscribers),
    current_month_leads: toNumber(data.current_month_leads),
    previous_month_leads: toNumber(data.previous_month_leads),
    monthly_growth: toNumber(data.monthly_growth),
  };
}

function readLiveMetricsResponse(response) {
  const data = response?.data;
  return {
    visitors_online: toMetricNumber(data?.visitors_online),
    active_projects: toMetricNumber(data?.active_projects),
    projects_delivered: toMetricNumber(data?.projects_delivered),
  };
}

function labelize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function journeyIndex(status) {
  const index = LEAD_JOURNEY.findIndex((stage) => stage.status === status);
  return index >= 0 ? index : 0;
}

function buildStageNotes(stage, values) {
  const lines = [`${stage.label} completed.`];
  stage.fields.forEach((field) => {
    const value = String(values?.[field.key] || "").trim();
    if (value) lines.push(`${field.label}: ${value}`);
  });
  return lines.join("\n");
}

function getBackendError(error, fallback = "Unable to load admin data.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const message = detail
      .map((item) => {
        if (typeof item === "string") return item;
        const location = Array.isArray(item?.loc) ? item.loc.filter((part) => part !== "body").join(".") : "";
        const text = item?.msg ?? item?.message ?? JSON.stringify(item);
        return location ? `${location}: ${text}` : text;
      })
      .filter(Boolean)
      .join(" ");
    return message || fallback;
  }
  if (detail && typeof detail === "object") return detail.message ?? detail.msg ?? JSON.stringify(detail);
  return error?.message || fallback;
}

function formatDate(value, mode = "date") {
  if (!value) return "-";
  const next = new Date(value);
  if (Number.isNaN(next.getTime())) return "-";
  return mode === "datetime" ? next.toLocaleString() : next.toLocaleDateString();
}

function isUnauthorized(result) {
  return result?.status === "rejected" && result.reason?.response?.status === 401;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ icon: Icon, label, value, accent = "#4D8BFF" }) {
  const SafeIcon = Icon ?? LayoutDashboard;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <SafeIcon size={18} style={{ color: accent }}/>
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385]">{label}</span>
      </div>
      <div className="mt-4 font-display text-[24px] font-semibold text-white">{value}</div>
    </div>
  );
}

function AnimatedMetricNumber({ value }) {
  const [display, setDisplay] = useState(() => toMetricNumber(value));
  const displayRef = useRef(display);

  useEffect(() => {
    const start = displayRef.current;
    const end = toMetricNumber(value);
    if (start === end) return;
    const startTime = performance.now();
    const duration = 550;
    let frame;
    const tick = (time) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(start + (end - start) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("leads");
  const [admin, setAdmin] = useState(() => ({
    name: localStorage.getItem("dortx-admin-name") || "DortX Admin",
    email: localStorage.getItem("dortx-admin-email") || "",
    avatar: localStorage.getItem("dortx-admin-avatar") || "",
  }));
  const [stats, setStats] = useState(EMPTY_STATS);
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [workflowDraft, setWorkflowDraft] = useState({});
  const [workflowSaving, setWorkflowSaving] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsMessage, setProjectsMessage] = useState("");
  const [liveMetrics, setLiveMetrics] = useState(EMPTY_LIVE_METRICS);
  const [liveDraft, setLiveDraft] = useState(EMPTY_LIVE_METRICS);
  const [liveSaving, setLiveSaving] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const [me, analytics, leadResponse, applicationResponse, subscriberResponse, liveResponse, projectsResponse] = await Promise.allSettled([
        adminApiClient.get("/auth/me"),
        adminApiClient.get("/admin/analytics"),
        adminApiClient.get(`/admin/leads?status=${status}&q=${encodeURIComponent(q)}&page=${page}&limit=20`),
        adminApiClient.get("/admin/applications"),
        adminApiClient.get("/admin/newsletter"),
        adminApiClient.get("/admin/live-metrics"),
        adminApiClient.get("/projects?archived=false&page=1&limit=100"),
      ]);

      if ([me, analytics, leadResponse, applicationResponse, subscriberResponse, liveResponse, projectsResponse].some(isUnauthorized)) {
        localStorage.removeItem("dortx-admin-token");
        localStorage.removeItem("dortx-admin-name");
        localStorage.removeItem("dortx-admin-email");
        localStorage.removeItem("dortx-admin-avatar");
        nav("/admin/login");
        return;
      }

      const errors = [];

      if (me.status === "fulfilled") {
        const profile = {
          name: me.value?.data?.name || me.value?.data?.email || "Admin",
          email: me.value?.data?.email || localStorage.getItem("dortx-admin-email") || "",
          avatar: me.value?.data?.avatar || "",
        };
        setAdmin(profile);
        localStorage.setItem("dortx-admin-name", profile.name);
        localStorage.setItem("dortx-admin-email", profile.email);
        if (profile.avatar) {
          localStorage.setItem("dortx-admin-avatar", profile.avatar);
        } else {
          localStorage.removeItem("dortx-admin-avatar");
        }
      } else {
        setAdmin((current) => ({
          name: current.name || current.email || "Admin",
          email: current.email || localStorage.getItem("dortx-admin-email") || "",
          avatar: current.avatar || "",
        }));
        errors.push(`Profile: ${getBackendError(me.reason, "Could not load admin profile.")}`);
      }

      if (analytics.status === "fulfilled") {
        try {
          setStats(readAnalyticsResponse(analytics.value));
        } catch (error) {
          errors.push(`Analytics: ${error.message}`);
        }
      } else {
        errors.push(`Analytics: ${getBackendError(analytics.reason, "Could not load analytics.")}`);
      }

      if (leadResponse.status === "fulfilled") {
        try {
          const leadData = readListResponse(leadResponse.value, "Leads", { paginated: true, keys: ["leads"] });
          setLeads(leadData.items);
          setTotal(leadData.total);
        } catch (error) {
          errors.push(`Leads: ${error.message}`);
        }
      } else {
        errors.push(`Leads: ${getBackendError(leadResponse.reason, "Could not load leads.")}`);
      }

      if (applicationResponse.status === "fulfilled") {
        try {
          const applicationData = readListResponse(applicationResponse.value, "Applications", { keys: ["applications"] });
          setApplications(applicationData.items);
        } catch (error) {
          errors.push(`Applications: ${error.message}`);
        }
      } else {
        errors.push(`Applications: ${getBackendError(applicationResponse.reason, "Could not load applications.")}`);
      }

      if (subscriberResponse.status === "fulfilled") {
        try {
          const subscriberData = readListResponse(subscriberResponse.value, "Newsletter", { keys: ["subscribers", "newsletter"] });
          setSubscribers(subscriberData.items);
        } catch (error) {
          errors.push(`Newsletter: ${error.message}`);
        }
      } else {
        errors.push(`Newsletter: ${getBackendError(subscriberResponse.reason, "Could not load newsletter subscribers.")}`);
      }

      if (liveResponse.status === "fulfilled") {
        try {
          const liveData = readLiveMetricsResponse(liveResponse.value);
          setLiveMetrics(liveData);
          setLiveDraft(liveData);
        } catch (error) {
          setLiveMetrics(EMPTY_LIVE_METRICS);
          setLiveDraft(EMPTY_LIVE_METRICS);
        }
      } else {
        setLiveMetrics(EMPTY_LIVE_METRICS);
        setLiveDraft(EMPTY_LIVE_METRICS);
      }

      if (projectsResponse.status === "fulfilled") {
        try {
          const projectData = readListResponse(projectsResponse.value, "Projects");
          setProjects(projectData.items);
          setProjectsMessage("");
        } catch (error) {
          setProjects([]);
          setProjectsMessage("Projects could not be loaded. Please try again.");
        }
      } else {
        setProjects([]);
        if (projectsResponse.reason?.response?.status === 404) {
          setProjectsMessage("Projects are not available on this backend yet.");
        } else {
          setProjectsMessage("Projects could not be loaded. Please try again.");
        }
      }

      setError(errors.join(" "));
    } catch (e) {
      setError(getBackendError(e, "Unexpected admin dashboard error."));
    } finally {
      setBusy(false);
    }
  }, [status, q, page, nav]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchLiveMetrics = useCallback(async () => {
    try {
      const response = await adminApiClient.get("/admin/live-metrics");
      const next = readLiveMetricsResponse(response);
      setLiveMetrics(next);
      setLiveDraft(next);
    } catch {
      setLiveMetrics(EMPTY_LIVE_METRICS);
      setLiveDraft(EMPTY_LIVE_METRICS);
    }
  }, []);

  useEffect(() => {
    fetchLiveMetrics();
    const timer = window.setInterval(fetchLiveMetrics, 10000);
    return () => window.clearInterval(timer);
  }, [fetchLiveMetrics]);

  useEffect(() => {
    if (!selected) {
      setWorkflowDraft({});
      setWorkflowMessage("");
      return;
    }
    const stage = LEAD_JOURNEY[journeyIndex(selected.status)];
    const existing = selected?.crm_workflow?.[stage.status]?.data || {};
    setWorkflowDraft(existing);
    setWorkflowMessage("");
  }, [selected?.id, selected?.status]);

  const logout = () => {
    localStorage.removeItem("dortx-admin-token");
    localStorage.removeItem("dortx-admin-name");
    localStorage.removeItem("dortx-admin-email");
    localStorage.removeItem("dortx-admin-avatar");
    nav("/admin/login");
  };

  const remove = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      await adminApiClient.delete(`/admin/leads/${id}`);
      setSelected(null);
      fetchAll();
    } catch (e) {
      setError(getBackendError(e, "Could not delete lead."));
    }
  };

  const exportCsv = async () => {
    try {
      const res = await adminApiClient.get("/admin/leads/export.csv", { responseType: "blob" });
      downloadBlob(res.data, "dortx_leads.csv");
    } catch (e) {
      setError(getBackendError(e, "Could not export leads."));
    }
  };

  const removeApplication = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this application permanently?")) return;
    try {
      await adminApiClient.delete(`/admin/applications/${id}`);
      setSelectedApplication(null);
      fetchAll();
    } catch (e) {
      setError(getBackendError(e, "Could not delete application."));
    }
  };

  const downloadResume = async (id) => {
    if (!id) return;
    try {
      const res = await adminApiClient.get(`/admin/applications/${id}/resume`, { responseType: "blob" });
      downloadBlob(res.data, "resume");
    } catch (e) {
      setError(getBackendError(e, "Could not download resume."));
    }
  };

  const exportApplications = async () => {
    try {
      const res = await adminApiClient.get("/admin/applications/export.csv", { responseType: "blob" });
      downloadBlob(res.data, "dortx_applications.csv");
    } catch (e) {
      setError(getBackendError(e, "Could not export applications."));
    }
  };

  const removeSubscriber = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this subscriber?")) return;
    try {
      await adminApiClient.delete(`/admin/newsletter/${id}`);
      fetchAll();
    } catch (e) {
      setError(getBackendError(e, "Could not delete subscriber."));
    }
  };

  const exportNewsletter = async () => {
    try {
      const res = await adminApiClient.get("/admin/newsletter/export.csv", { responseType: "blob" });
      downloadBlob(res.data, "dortx_newsletter.csv");
    } catch (e) {
      setError(getBackendError(e, "Could not export newsletter."));
    }
  };

  const updateLiveDraft = (key, value) => {
    setLiveDraft((current) => ({ ...current, [key]: toMetricNumber(value) }));
    setLiveMessage("");
  };

  const saveLiveMetrics = async () => {
    setLiveSaving(true);
    setLiveMessage("");
    try {
      const payload = {
        active_projects: toMetricNumber(liveDraft.active_projects),
        projects_delivered: toMetricNumber(liveDraft.projects_delivered),
      };
      const res = await adminApiClient.patch("/admin/live-metrics", payload);
      const next = readLiveMetricsResponse(res);
      setLiveMetrics(next);
      setLiveDraft(next);
      setLiveMessage("Live metrics saved.");
    } catch (e) {
      setLiveMessage(getBackendError(e, "Could not save live metrics."));
    } finally {
      setLiveSaving(false);
    }
  };

  const updateWorkflowDraft = (key, value) => {
    setWorkflowDraft((current) => ({ ...current, [key]: value }));
    setWorkflowMessage("");
  };

  const completeCurrentLeadStage = async () => {
    if (!selected?.id || workflowSaving) return;
    const currentIndex = journeyIndex(selected.status);
    const currentStage = LEAD_JOURNEY[currentIndex];
    const nextStage = LEAD_JOURNEY[Math.min(currentIndex + 1, LEAD_JOURNEY.length - 1)];
    const nextStatus = currentStage.status === "project_started" ? "project_started" : nextStage.status;
    setWorkflowSaving(true);
    setWorkflowMessage("");
    try {
      const payload = {
        status: nextStatus,
        notes: buildStageNotes(currentStage, workflowDraft),
      };
      const response = await adminApiClient.patch(`/admin/leads/${selected.id}/status`, payload);
      const updatedLead = response.data?.lead || selected;
      setSelected(updatedLead);
      setLeads((items) => items.map((lead) => (lead?.id === updatedLead.id ? updatedLead : lead)));
      await fetchAll();
      if (nextStatus === "project_started") {
        setWorkflowMessage("Lead converted to a project. Opening Projects module...");
        setTab("projects");
        setSelected(null);
      } else {
        setWorkflowMessage(`${currentStage.label} completed. ${nextStage.label} is now active.`);
      }
    } catch (error) {
      console.error("Lead workflow update failed", error);
      setWorkflowMessage("Could not complete this stage. Please try again.");
    } finally {
      setWorkflowSaving(false);
    }
  };

  const safeLeads = toArray(leads) ?? [];
  const safeApplications = toArray(applications) ?? [];
  const safeSubscribers = toArray(subscribers) ?? [];
  const safeProjects = toArray(projects);
  const safeServices = toArray(stats?.by_service) ?? [];
  const leadsCount = safeLeads?.length ?? 0;
  const applicationsCount = safeApplications?.length ?? 0;
  const subscribersCount = safeSubscribers?.length ?? 0;
  const projectsCount = safeProjects?.length ?? 0;
  const servicesCount = safeServices?.length ?? 0;
  const selectedStatusClass = STATUS_COLOR[selected?.status] ?? STATUS_COLOR.new;
  const selectedApplicationStatusClass = STATUS_COLOR[selectedApplication?.status] ?? STATUS_COLOR.new;
  const adminInitial = (admin.name || admin.email || "A").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#05080F] noise" data-testid="admin-dashboard">
      <header className="border-b border-white/8 sticky top-0 z-40 glass-strong">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo height={24}/>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#4D8BFF] hidden sm:block">Admin Console</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 pr-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center text-[12px] font-semibold text-white">
                {admin.avatar ? <img src={admin.avatar} alt={admin.name || "Admin"} className="w-full h-full object-cover"/> : adminInitial}
              </div>
              <div className="leading-tight">
                <div className="text-[12.5px] text-white">{admin.name || "DortX Admin"}</div>
                <div className="text-[11.5px] text-[#9AA3B8]">{admin.email || "admin"}</div>
              </div>
            </div>
            <Link to="/" className="btn-ghost !py-2 !px-3 !text-[12.5px]">View site</Link>
            <button onClick={logout} data-testid="admin-logout" className="btn-ghost !py-2 !px-3 !text-[12.5px]"><LogOut size={13}/> Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total leads" value={stats?.total_leads ?? 0}/>
          <StatCard icon={Mail} label="New" value={stats?.by_status?.new ?? 0} accent="#60A5FA"/>
          <StatCard icon={Briefcase} label="Applications" value={stats?.applications ?? 0} accent="#A78BFA"/>
          <StatCard icon={Send} label="Newsletter" value={stats?.subscribers ?? 0} accent="#34D399"/>
        </div>
        {error && (
          <div className="mt-4 glass rounded-xl px-4 py-3 text-[13px] text-amber-200 border border-amber-500/20">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {[
            { k: "leads", label: "Leads", Icon: Inbox },
            { k: "team", label: "Team", Icon: UserCog },
            { k: "projects", label: "Projects", Icon: ClipboardCheck },
            { k: "applications", label: "Applications", Icon: FileText },
            { k: "newsletter", label: "Newsletter", Icon: Send },
            { k: "analytics", label: "Analytics", Icon: LayoutDashboard },
            { k: "live", label: "Live", Icon: Activity },
          ].map(({ k, label, Icon }) => (
            <button
              key={k}
              data-testid={`tab-${k}`}
              onClick={() => setTab(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] transition border ${
                tab === k ? "bg-white/8 text-white border-[#1E6BFF]/40" : "border-white/10 text-[#9AA3B8] hover:text-white hover:bg-white/4"
              }`}
            >
              <Icon size={13}/> {label}
            </button>
          ))}
        </div>

        {tab === "leads" && (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 w-full sm:min-w-[240px] glass rounded-full px-4 py-2.5">
                <Search size={15} className="text-[#6B7385]"/>
                <input
                  data-testid="leads-search"
                  placeholder="Search name, email, company..."
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  className="bg-transparent flex-1 outline-none text-[13.5px]"
                />
              </div>
              <select data-testid="leads-status-filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="glass rounded-full px-4 py-2.5 text-[13px] outline-none">
                {STATUSES.map((s) => <option key={s} value={s} label={s === "all" ? "All statuses" : s}>{s === "all" ? "All statuses" : s}</option>)}
              </select>
              <button onClick={fetchAll} className="btn-ghost !py-2.5"><RefreshCw size={14}/> Refresh</button>
              <button data-testid="export-csv" onClick={exportCsv} className="btn-primary !py-2.5"><Download size={14}/> Export CSV</button>
            </div>

            <div className="mt-6 glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]" data-testid="leads-table">
                  <thead className="bg-white/[0.03] text-[#9AA3B8] text-left">
                    <tr>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium hidden md:table-cell">Service</th>
                      <th className="px-5 py-3 font-medium hidden md:table-cell">Budget</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium hidden lg:table-cell">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {busy && (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-[#6B7385]">Loading leads...</td></tr>
                    )}
                    {leadsCount === 0 && !busy && (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-[#6B7385]">No leads found.</td></tr>
                    )}
                    {!busy && safeLeads.map((l, index) => (
                      <tr key={l?.id ?? index} onClick={() => setSelected(l ?? {})} className="hover:bg-white/[0.03] cursor-pointer transition" data-testid={`lead-row-${l?.id ?? index}`}>
                        <td className="px-5 py-3 text-white font-medium">{l?.name || "-"}</td>
                        <td className="px-5 py-3 text-[#C9D2E0]">
                          {l?.email ? (
                            <a href={`mailto:${l.email}`} onClick={(event) => event.stopPropagation()} className="hover:text-white hover:underline underline-offset-4 transition">
                              {l.email}
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-5 py-3 text-[#9AA3B8] hidden md:table-cell">{l?.service || "-"}</td>
                        <td className="px-5 py-3 text-[#9AA3B8] hidden md:table-cell">{l?.budget || "-"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_COLOR[l?.status] ?? STATUS_COLOR.new}`}>{l?.status || "new"}</span>
                        </td>
                        <td className="px-5 py-3 text-[#6B7385] hidden lg:table-cell">{formatDate(l?.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 text-[12.5px] text-[#9AA3B8]">
                <div>Showing {leadsCount} of {total}</div>
                <div className="flex items-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded-md border border-white/10 disabled:opacity-40">Prev</button>
                  <span>Page {page}</span>
                  <button disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-md border border-white/10 disabled:opacity-40">Next</button>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "team" && <TeamManager />}

        {tab === "projects" && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-[18px] font-semibold text-white">Projects module</div>
                <div className="mt-1 text-[13px] text-[#9AA3B8]">Projects appear here after a lead reaches Convert to Project.</div>
              </div>
              <button onClick={fetchAll} className="btn-ghost !py-2.5"><RefreshCw size={14}/> Refresh</button>
            </div>
            <div className="mt-4 glass rounded-2xl overflow-hidden" data-testid="projects-panel">
              {projectsMessage && (
                <div className="border-b border-white/8 px-5 py-3 text-[13px] text-amber-200 bg-amber-500/5">
                  {projectsMessage}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]">
                  <thead className="bg-white/[0.03] text-[#9AA3B8] text-left">
                    <tr>
                      <th className="px-5 py-3 font-medium">Project</th>
                      <th className="px-5 py-3 font-medium hidden md:table-cell">Client</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium hidden lg:table-cell">Completed</th>
                      <th className="px-5 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {busy && (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-[#6B7385]">Loading projects...</td></tr>
                    )}
                    {projectsCount === 0 && !busy && !projectsMessage && (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-[#6B7385]">No projects yet - projects appear once a lead reaches Project Started.</td></tr>
                    )}
                    {projectsCount === 0 && !busy && projectsMessage && (
                      <tr><td colSpan={5} className="px-5 py-10 text-center text-[#6B7385]">Projects will appear here once the backend project API is available and a lead reaches Project Started.</td></tr>
                    )}
                    {!busy && safeProjects.map((project, index) => (
                      <tr key={project?.id ?? index} className="hover:bg-white/[0.03] transition">
                        <td className="px-5 py-3 text-white font-medium">{project?.project_name || "-"}</td>
                        <td className="px-5 py-3 text-[#9AA3B8] hidden md:table-cell">{project?.client_name || "-"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_COLOR[project?.status] ?? STATUS_COLOR.not_started}`}>{project?.status || "not_started"}</span>
                        </td>
                        <td className="px-5 py-3 text-[#6B7385] hidden lg:table-cell">{formatDate(project?.completion?.completed_at, "datetime")}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => setSelectedProject(project)} className="px-3 py-1.5 rounded-full text-[12px] border border-[#1E6BFF]/35 text-[#9DB8FF] hover:bg-[#1E6BFF]/10">
                            <ClipboardCheck size={12} className="inline mr-1"/>Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "applications" && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button onClick={fetchAll} className="btn-ghost !py-2.5"><RefreshCw size={14}/> Refresh</button>
              <button onClick={exportApplications} className="btn-primary !py-2.5"><Download size={14}/> Export CSV</button>
            </div>
            <div className="mt-4 glass rounded-2xl overflow-hidden" data-testid="applications-panel">
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]">
                  <thead className="bg-white/[0.03] text-[#9AA3B8] text-left">
                    <tr>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium hidden md:table-cell">Phone</th>
                      <th className="px-5 py-3 font-medium hidden md:table-cell">Position</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium hidden lg:table-cell">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {busy && (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-[#6B7385]">Loading applications...</td></tr>
                    )}
                    {applicationsCount === 0 && !busy && (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-[#6B7385]">No applications yet.</td></tr>
                    )}
                    {!busy && safeApplications.map((a, index) => (
                      <tr key={a?.id ?? index} onClick={() => setSelectedApplication(a ?? {})} className="hover:bg-white/[0.03] cursor-pointer transition">
                        <td className="px-5 py-3 text-white font-medium">{a?.name || "-"}</td>
                        <td className="px-5 py-3 text-[#C9D2E0]">
                          {a?.email ? (
                            <a href={`mailto:${a.email}`} onClick={(event) => event.stopPropagation()} className="hover:text-white hover:underline underline-offset-4 transition">
                              {a.email}
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-5 py-3 text-[#9AA3B8] hidden md:table-cell">{a?.phone || "-"}</td>
                        <td className="px-5 py-3 text-[#9AA3B8] hidden md:table-cell">{a?.position || "-"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_COLOR[a?.status] ?? STATUS_COLOR.new}`}>{a?.status || "new"}</span>
                        </td>
                        <td className="px-5 py-3 text-[#6B7385] hidden lg:table-cell">{formatDate(a?.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "newsletter" && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button onClick={fetchAll} className="btn-ghost !py-2.5"><RefreshCw size={14}/> Refresh</button>
              <button onClick={exportNewsletter} className="btn-primary !py-2.5"><Download size={14}/> Export CSV</button>
            </div>
            <div className="mt-4 glass rounded-2xl overflow-hidden" data-testid="newsletter-panel">
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]">
                  <thead className="bg-white/[0.03] text-[#9AA3B8] text-left">
                    <tr>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium hidden md:table-cell">Source</th>
                      <th className="px-5 py-3 font-medium hidden lg:table-cell">Subscribed</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {busy && (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-[#6B7385]">Loading subscribers...</td></tr>
                    )}
                    {subscribersCount === 0 && !busy && (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-[#6B7385]">No subscribers yet.</td></tr>
                    )}
                    {!busy && safeSubscribers.map((s, index) => (
                      <tr key={s?.id ?? index} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-3 text-white">
                          {s?.email ? (
                            <a href={`mailto:${s.email}`} className="hover:text-[#9DB8FF] hover:underline underline-offset-4 transition">
                              {s.email}
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-5 py-3 text-[#9AA3B8] hidden md:table-cell">{s?.source || "-"}</td>
                        <td className="px-5 py-3 text-[#6B7385] hidden lg:table-cell">{formatDate(s?.created_at)}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => removeSubscriber(s?.id)} className="px-3 py-1.5 rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10 text-[12px]"><Trash2 size={11} className="inline mr-1"/>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "live" && (
          <div className="mt-6 grid lg:grid-cols-3 gap-4" data-testid="live-metrics-panel">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[#6B7385]">
                <Users size={14} className="text-[#4D8BFF]"/> Visitors Online
              </div>
              <div className="mt-4 font-display text-[32px] font-semibold text-white tabular-nums"><AnimatedMetricNumber value={liveMetrics.visitors_online}/></div>
              <div className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-emerald-300">
                <span className="dot-pulse" aria-hidden="true"/> LIVE
              </div>
            </div>

            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-display text-[18px] font-semibold text-white">Homepage live metrics</div>
                  <div className="mt-1 text-[13px] text-[#9AA3B8]">Active Projects and Projects Delivered are controlled here.</div>
                </div>
                <button onClick={fetchAll} className="btn-ghost !py-2.5 !px-4 !text-[12.5px]"><RefreshCw size={14}/> Refresh</button>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#6B7385]">
                    <FolderKanban size={13} className="text-[#4D8BFF]"/> Active Projects
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={liveDraft.active_projects}
                    onChange={(event) => updateLiveDraft("active_projects", event.target.value)}
                    className="contact-field mt-2"
                  />
                  <div className="mt-3 font-display text-[24px] font-semibold text-white tabular-nums"><AnimatedMetricNumber value={liveMetrics.active_projects}/></div>
                </label>
                <label className="block">
                  <span className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#6B7385]">
                    <CheckCircle2 size={13} className="text-[#4D8BFF]"/> Projects Delivered
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={liveDraft.projects_delivered}
                    onChange={(event) => updateLiveDraft("projects_delivered", event.target.value)}
                    className="contact-field mt-2"
                  />
                  <div className="mt-3 font-display text-[24px] font-semibold text-white tabular-nums"><AnimatedMetricNumber value={liveMetrics.projects_delivered}/></div>
                </label>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <button onClick={saveLiveMetrics} disabled={liveSaving} className="btn-primary !py-2.5 !px-5 !text-[13px] disabled:opacity-60">
                  <Save size={14}/> {liveSaving ? "Saving..." : "Save live metrics"}
                </button>
                {liveMessage && <div className="text-[13px] text-[#9AA3B8]">{liveMessage}</div>}
              </div>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="mt-6 grid lg:grid-cols-2 gap-4" data-testid="analytics-panel">
            <div className="glass rounded-2xl p-6">
              <div className="font-display text-[15px] text-white font-semibold">Leads by status</div>
              <div className="mb-4 mt-1 text-[12.5px] text-[#9AA3B8]">
                Monthly growth: {stats?.monthly_growth ?? 0}% ({stats?.current_month_leads ?? 0} this month)
              </div>
              <div className="space-y-2.5">
                {STATUSES.filter((x) => x !== "all").map((s) => {
                  const c = stats?.by_status?.[s] ?? 0;
                  const pct = stats?.total_leads ? Math.round((c / stats.total_leads) * 100) : 0;
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-[12.5px] mb-1">
                        <span className="text-[#C9D2E0] capitalize">{s}</span>
                        <span className="text-[#9AA3B8]">{c} - {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                        <div className="h-full gradient-blue" style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="font-display text-[15px] text-white font-semibold mb-4">Top services requested</div>
              <div className="space-y-2.5">
                {safeServices.slice(0, 6).map((s, index) => (
                  <div key={s?.service ?? index} className="flex justify-between text-[13px]">
                    <span className="text-[#C9D2E0]">{s?.service || "Unspecified"}</span>
                    <span className="text-[#9AA3B8]">{s?.count ?? 0}</span>
                  </div>
                ))}
                {servicesCount === 0 && (
                  <div className="text-[#6B7385] text-[13px]">No data yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelected(null)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-end sm:items-center justify-center p-4">
          <motion.div initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-strong rounded-2xl max-w-5xl w-full p-6 max-h-[88vh] overflow-y-auto" data-testid="lead-detail-modal">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-[22px] font-semibold text-white">{selected?.name || "Lead"}</div>
                {selected?.email ? (
                  <a href={`mailto:${selected.email}`} className="text-[13.5px] text-[#4D8BFF] hover:text-white hover:underline underline-offset-4 transition">{selected.email}</a>
                ) : (
                  <div className="text-[13.5px] text-[#6B7385]">No email provided</div>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full border border-white/10 text-[#9AA3B8] hover:text-white hover:bg-white/5 flex items-center justify-center" aria-label="Close">
                <X size={16}/>
              </button>
            </div>
            <LeadWorkflow
              lead={selected}
              draft={workflowDraft}
              saving={workflowSaving}
              message={workflowMessage}
              onDraftChange={updateWorkflowDraft}
              onComplete={completeCurrentLeadStage}
              onDelete={() => remove(selected?.id)}
            />
          </motion.div>
        </motion.div>
      )}

      {selectedApplication && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedApplication(null)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-end sm:items-center justify-center p-4">
          <motion.div initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-strong rounded-2xl max-w-2xl w-full p-7 max-h-[85vh] overflow-y-auto" data-testid="application-detail-modal">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-[22px] font-semibold text-white">{selectedApplication?.name || "Application"}</div>
                {selectedApplication?.email ? (
                  <a href={`mailto:${selectedApplication.email}`} className="text-[13.5px] text-[#4D8BFF] hover:text-white hover:underline underline-offset-4 transition">{selectedApplication.email}</a>
                ) : (
                  <div className="text-[13.5px] text-[#6B7385]">No email provided</div>
                )}
              </div>
              <span className={`text-[11px] px-2.5 py-1 rounded-full border ${selectedApplicationStatusClass}`}>{selectedApplication?.status || "new"}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6 text-[13.5px]">
              <Info l="Phone" v={selectedApplication?.phone}/>
              <Info l="Position" v={selectedApplication?.position}/>
              <Info l="Experience" v={selectedApplication?.experience}/>
              <Info l="LinkedIn" v={selectedApplication?.linkedin}/>
              <Info l="GitHub" v={selectedApplication?.github}/>
              <Info l="Portfolio" v={selectedApplication?.portfolio}/>
              <Info l="Applied" v={formatDate(selectedApplication?.created_at, "datetime")}/>
            </div>
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385] mb-2">Cover letter</div>
              <p className="text-[14px] text-[#C9D2E0] whitespace-pre-wrap leading-relaxed">{selectedApplication?.cover_letter || "-"}</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {(selectedApplication?.resume_file_path || selectedApplication?.file_path || selectedApplication?.resume_url) && (
                selectedApplication?.resume_url ? (
                  <a href={selectedApplication.resume_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full text-[12px] border border-white/10 text-[#9AA3B8] hover:bg-white/5"><Download size={12} className="inline mr-1"/>Resume</a>
                ) : (
                  <button onClick={() => downloadResume(selectedApplication?.id)} className="px-3 py-1.5 rounded-full text-[12px] border border-white/10 text-[#9AA3B8] hover:bg-white/5"><Download size={12} className="inline mr-1"/>Resume</button>
                )
              )}
              <button onClick={() => removeApplication(selectedApplication?.id)} className="ml-auto px-3 py-1.5 rounded-full text-[12px] border border-red-500/30 text-red-300 hover:bg-red-500/10"><Trash2 size={12} className="inline mr-1"/>Delete</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {selectedProject && (
        <ProjectCompletionModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onChanged={(project) => {
            setSelectedProject(project);
            fetchAll();
          }}
        />
      )}

    </div>
  );
}

function Info({ l, v }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385]">{l}</div>
      <div className="text-white mt-1">{v || "-"}</div>
    </div>
  );
}

function LeadWorkflow({ lead, draft, saving, message, onDraftChange, onComplete, onDelete }) {
  const activeIndex = journeyIndex(lead?.status);
  const activeStage = LEAD_JOURNEY[activeIndex];
  const isConverted = lead?.status === "project_started";

  return (
    <div className="mt-6 grid lg:grid-cols-[0.85fr_1.15fr] gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <div className="font-display text-[16px] font-semibold text-white">Lead Journey</div>
        <div className="mt-4 space-y-2">
          {LEAD_JOURNEY.map((stage, index) => {
            const completed = index < activeIndex || (isConverted && stage.status === "project_started");
            const active = index === activeIndex && !completed;
            return (
              <div
                key={stage.status}
                className={`relative flex gap-3 rounded-xl border px-3 py-3 transition ${
                  completed
                    ? "border-emerald-500/20 bg-emerald-500/8"
                    : active
                      ? "border-[#1E6BFF]/45 bg-[#1E6BFF]/10 shadow-[0_0_24px_rgba(30,107,255,0.18)]"
                      : "border-white/8 bg-black/20 opacity-65"
                }`}
              >
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                  completed ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200" : active ? "border-[#6EA0FF]/50 bg-[#1E6BFF]/20 text-[#CFE0FF]" : "border-white/10 text-[#6B7385]"
                }`}>
                  {completed ? <CheckCircle2 size={14}/> : active ? <span className="h-2 w-2 rounded-full bg-[#6EA0FF] animate-pulse"/> : index + 1}
                </div>
                <div>
                  <div className="text-[13.5px] font-medium text-white">{stage.label}</div>
                  <div className="mt-0.5 text-[11.5px] text-[#9AA3B8]">{completed ? "Completed" : active ? "Active stage" : "Locked"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="grid sm:grid-cols-2 gap-4 text-[13.5px]">
            <Info l="Company" v={lead?.company}/>
            <Info l="Phone" v={lead?.phone}/>
            <Info l="Service" v={lead?.service}/>
            <Info l="Subject" v={lead?.subject}/>
            <Info l="Budget" v={lead?.budget}/>
            <Info l="Created" v={formatDate(lead?.created_at, "datetime")}/>
          </div>
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385] mb-2">Description</div>
            <p className="text-[14px] text-[#C9D2E0] whitespace-pre-wrap leading-relaxed">{lead?.description || "-"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1E6BFF]/25 bg-[#061225]/75 p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#6B7385]">Current stage</div>
              <div className="font-display text-[20px] font-semibold text-white mt-1">{activeStage.label}</div>
            </div>
            <div className="text-[12px] text-[#9AA3B8]">{activeIndex + 1} of {LEAD_JOURNEY.length}</div>
          </div>

          <div className="mt-5 grid gap-3">
            {activeStage.fields.map((field) => (
              <label key={field.key} className="block">
                <span className="text-[12px] uppercase tracking-[0.14em] text-[#6B7385]">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    value={draft?.[field.key] || ""}
                    onChange={(event) => onDraftChange(field.key, event.target.value)}
                    className="contact-field mt-2 min-h-[96px]"
                    placeholder={field.label}
                    disabled={isConverted}
                  />
                ) : (
                  <input
                    value={draft?.[field.key] || ""}
                    onChange={(event) => onDraftChange(field.key, event.target.value)}
                    className="contact-field mt-2"
                    placeholder={field.label}
                    disabled={isConverted}
                  />
                )}
              </label>
            ))}
          </div>

          {message && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-[#C9D2E0]">{message}</div>}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={onComplete}
              disabled={saving || isConverted}
              className="btn-primary !py-2.5 !px-5 !text-[13px] disabled:opacity-50"
            >
              <CheckCircle2 size={14}/> {saving ? "Saving..." : isConverted ? "Project Created" : activeStage.status === "project_started" ? "Convert to Project" : "Complete Stage"}
            </button>
            <button onClick={onDelete} className="ml-auto px-3 py-1.5 rounded-full text-[12px] border border-red-500/30 text-red-300 hover:bg-red-500/10">
              <Trash2 size={12} className="inline mr-1"/>Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCompletionModal({ project, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState(project?.completion?.final_notes || "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackLink, setFeedbackLink] = useState("");

  const load = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await adminApiClient.get(`/projects/${project.id}/completion`);
      setData(response.data);
      setNotes(response.data?.completion?.final_notes || "");
      onChanged(response.data?.project || project);
    } catch (error) {
      console.error("Project completion load failed", error);
      setMessage(getBackendError(error, "Could not load project completion details."));
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  useEffect(() => { load(); }, [load]);

  const currentProject = data?.project || project || {};
  const checklist = data?.checklist || currentProject?.completion_checklist || {};
  const completion = data?.completion || currentProject?.completion || {};
  const feedback = data?.feedback || currentProject?.feedback || {};
  const unmet = data?.unmet_items || [];
  const isCompleted = currentProject?.status === "completed";

  const patchChecklist = async (key, value) => {
    setMessage("");
    try {
      const response = await adminApiClient.patch(`/projects/${currentProject.id}/completion/checklist`, { [key]: value });
      setData((current) => ({
        ...(current || {}),
        checklist: response.data?.checklist || { ...checklist, [key]: value },
        unmet_items: response.data?.unmet_items || [],
        project: {
          ...currentProject,
          completion_checklist: response.data?.checklist || { ...checklist, [key]: value },
        },
      }));
      setMessage("Checklist updated.");
    } catch (error) {
      console.error("Project checklist update failed", error);
      setMessage("Could not update checklist. Please try again.");
    }
  };

  const complete = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await adminApiClient.post(`/projects/${currentProject.id}/completion/complete`);
      setData(response.data);
      onChanged(response.data?.project || currentProject);
      setMessage("Project marked completed.");
    } catch (error) {
      console.error("Project completion failed", error);
      const missing = error?.response?.data?.unmet_items || error?.response?.data?.detail?.unmet_items;
      setMessage(Array.isArray(missing) && missing.length ? `Complete these first: ${missing.map(labelize).join(", ")}.` : "Could not complete project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    setMessage("");
    try {
      const response = await adminApiClient.patch(`/projects/${currentProject.id}/completion/notes`, { final_notes: notes });
      setData(response.data);
      onChanged(response.data?.project || currentProject);
      setMessage("Final notes saved.");
    } catch (error) {
      console.error("Project notes save failed", error);
      setMessage("Could not save notes. Please try again.");
    }
  };

  const downloadPdf = async (kind) => {
    setMessage("");
    try {
      const response = await adminApiClient.get(`/projects/${currentProject.id}/completion/${kind}`, { responseType: "blob" });
      downloadBlob(response.data, `${kind}-${currentProject.id}.pdf`);
    } catch (error) {
      console.error(`Project ${kind} download failed`, error);
      setMessage(`Could not download ${kind}. Please try again.`);
    }
  };

  const requestFeedback = async () => {
    setMessage("");
    try {
      const response = await adminApiClient.post(`/projects/${currentProject.id}/completion/feedback/request`);
      setFeedbackLink(response.data?.feedback_url || "");
      setMessage("Feedback link generated.");
    } catch (error) {
      console.error("Feedback request failed", error);
      setMessage("Could not generate feedback link. Please try again.");
    }
  };

  const submitFeedback = async () => {
    setMessage("");
    try {
      const response = await adminApiClient.post(`/projects/${currentProject.id}/completion/feedback`, { rating: Number(rating), comment });
      setData((current) => ({ ...(current || {}), feedback: response.data?.feedback || feedback }));
      setComment("");
      setMessage("Feedback recorded.");
    } catch (error) {
      console.error("Feedback save failed", error);
      setMessage("Could not save feedback. Please try again.");
    }
  };

  const archiveProject = async () => {
    setMessage("");
    try {
      const response = await adminApiClient.post(`/projects/${currentProject.id}/completion/archive`, { archive: true });
      setData(response.data);
      onChanged(response.data?.project || currentProject);
      setMessage("Project archived.");
    } catch (error) {
      console.error("Project archive failed", error);
      setMessage("Could not archive project. Please try again.");
    }
  };

  const createFollowOnProject = async () => {
    setMessage("");
    try {
      await adminApiClient.post(`/projects/${currentProject.id}/completion/follow-on-project`, {});
      setMessage("Follow-on project created.");
    } catch (error) {
      console.error("Follow-on project creation failed", error);
      setMessage("Could not create follow-on project. Please try again.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-end sm:items-center justify-center p-4">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Project completion"
        initial={{ y: 30, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(event) => event.stopPropagation()}
        className="glass-strong rounded-2xl max-w-4xl w-full p-6 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-[22px] font-semibold text-white">{currentProject?.project_name || "Project completion"}</div>
            <div className="mt-1 text-[13px] text-[#9AA3B8]">{currentProject?.client_name || "Client"} · {labelize(currentProject?.status || "not_started")}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-white/10 text-[#9AA3B8] hover:text-white hover:bg-white/5 flex items-center justify-center" aria-label="Close">
            <X size={16}/>
          </button>
        </div>

        {message && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-[#C9D2E0]">{message}</div>}

        <div className="mt-5 grid lg:grid-cols-[1.25fr_0.75fr] gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 font-display text-[15px] text-white font-semibold"><ClipboardCheck size={16} className="text-[#4D8BFF]"/>Completion checklist</div>
            <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
              {COMPLETION_CHECKLIST.map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5 text-[13px] text-[#C9D2E0]">
                  <input
                    type="checkbox"
                    checked={Boolean(checklist?.[key])}
                    disabled={loading || isCompleted}
                    onChange={(event) => patchChecklist(key, event.target.checked)}
                    className="accent-[#4D8BFF]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Final notes"
              className="contact-field mt-4 min-h-[100px]"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={saveNotes} className="btn-ghost !py-2 !px-4 !text-[12.5px]"><Save size={13}/>Save notes</button>
              <button onClick={complete} disabled={loading || isCompleted} className="btn-primary !py-2 !px-4 !text-[12.5px] disabled:opacity-50"><CheckCircle2 size={13}/>{loading ? "Working..." : isCompleted ? "Completed" : "Mark completed"}</button>
            </div>
            {!isCompleted && unmet.length > 0 && (
              <div className="mt-3 text-[12.5px] text-[#9AA3B8]">Remaining: {unmet.map(labelize).join(", ")}</div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="font-display text-[15px] text-white font-semibold">Documents</div>
              <div className="mt-3 grid gap-2">
                <button onClick={() => downloadPdf("report")} disabled={!isCompleted} className="btn-ghost !justify-start !py-2 !text-[12.5px] disabled:opacity-50"><Download size={13}/>Completion report</button>
                <button onClick={() => downloadPdf("certificate")} disabled={!isCompleted} className="btn-ghost !justify-start !py-2 !text-[12.5px] disabled:opacity-50"><Download size={13}/>Completion certificate</button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center gap-2 font-display text-[15px] text-white font-semibold"><Star size={15} className="text-[#4D8BFF]"/>Feedback</div>
              <div className="mt-2 text-[12.5px] text-[#9AA3B8]">Saved rating: {feedback?.rating || "-"}</div>
              <div className="mt-3 flex gap-2">
                <input type="number" min="1" max="5" value={rating} onChange={(event) => setRating(event.target.value)} className="contact-field !py-2 !w-20"/>
                <button onClick={submitFeedback} className="btn-ghost !py-2 !px-4 !text-[12.5px]">Save</button>
              </div>
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Feedback comment" className="contact-field mt-2 min-h-[74px]"/>
              <button onClick={requestFeedback} className="btn-ghost !py-2 !px-4 !text-[12.5px] mt-2"><Send size={13}/>Request link</button>
              {feedbackLink && <div className="mt-2 break-all text-[12px] text-[#9DB8FF]">{feedbackLink}</div>}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <Info l="Completed" v={formatDate(completion?.completed_at, "datetime")}/>
                <Info l="Duration" v={completion?.duration_days !== null && completion?.duration_days !== undefined ? `${completion.duration_days} days` : "-"}/>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={archiveProject} disabled={!isCompleted} className="btn-ghost !py-2 !px-4 !text-[12.5px] disabled:opacity-50"><Archive size={13}/>Archive</button>
                <button onClick={createFollowOnProject} disabled={!isCompleted} className="btn-ghost !py-2 !px-4 !text-[12.5px] disabled:opacity-50"><FolderKanban size={13}/>Follow-on</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
