import { isValidElement, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Download, LogOut, Trash2, RefreshCw, Users, Mail, Briefcase, Send, LayoutDashboard, Inbox, FileText, UserCog, Activity, Save, FolderKanban, CheckCircle2, ClipboardCheck, Archive, Star, X, ShieldCheck, FileSignature, ExternalLink, PenLine, Upload, Settings } from "lucide-react";
import Logo from "@/components/Logo";
import TeamManager from "@/pages/admin/TeamManager";
import { adminApiClient } from "@/config/api";

const LEAD_STATUSES = [
  "new",
  "requirement_discussion",
  "proposal_generated",
  "agreement_generated",
  "agreement_sent",
  "client_signed",
  "dortx_signed",
  "advance_paid",
  "project_started",
  "completed",
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
  agreement_sent: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  agreement_signed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  client_signed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  dortx_signed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
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
  total_visitors: null,
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
  { status: "new", label: "Lead Received", fields: [{ key: "notes", label: "Lead notes", type: "textarea" }] },
  { status: "requirement_discussion", label: "Requirement Discussed", fields: [{ key: "requirements", label: "Requirements discussed", type: "textarea" }, { key: "timeline", label: "Expected timeline", type: "text" }] },
  { status: "proposal_generated", label: "Proposal Ready", fields: [{ key: "project_name", label: "Project name", type: "text" }, { key: "proposal_scope", label: "Proposal summary", type: "textarea" }, { key: "estimated_price", label: "Estimated price", type: "text" }] },
  { status: "agreement_generated", label: "Agreement Ready", fields: [] },
  { status: "agreement_sent", label: "Agreement Sent", fields: [] },
  { status: "client_signed", label: "Client Signed", fields: [] },
  { status: "dortx_signed", label: "DortX Signed", fields: [] },
  { status: "advance_paid", label: "Advance Paid", fields: [{ key: "amount", label: "Amount received", type: "text" }, { key: "payment_mode", label: "Payment mode", type: "text" }, { key: "transaction_id", label: "Transaction ID", type: "text" }] },
  { status: "project_started", label: "Project Started", fields: [{ key: "project_name", label: "Project name", type: "text" }, { key: "project_notes", label: "Project kickoff notes", type: "textarea" }] },
  { status: "completed", label: "Completed", fields: [{ key: "completion_notes", label: "Completion notes", type: "textarea" }] },
];
const LEGACY_STATUS_MAP = {
  contacted: "requirement_discussion",
  proposal_sent: "proposal_generated",
  proposal_accepted: "agreement_generated",
  sent_to_client: "agreement_sent",
  agreement_signed: "dortx_signed",
  invoice_generated: "advance_paid",
  in_progress: "project_started",
  delivered: "completed",
};
const STATUS_LABELS = LEAD_JOURNEY.reduce((acc, stage) => ({ ...acc, [stage.status]: stage.label }), {
  not_started: "Not Started",
  testing: "Testing",
  on_hold: "On Hold",
  cancelled: "Cancelled",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
  lost: "Lost",
});
const AGREEMENT_CLAUSES = [
  ["terms_conditions", "Terms & Conditions"],
  ["privacy_policy", "Privacy Policy"],
  ["project_scope", "Project Scope"],
  ["deliverables", "Deliverables"],
  ["timeline", "Timeline"],
  ["payment_terms", "Payment Terms"],
  ["refund_policy", "Refund Policy"],
  ["change_request_policy", "Change Request Policy"],
  ["warranty", "Warranty"],
  ["support_terms", "Support Terms"],
  ["intellectual_property", "Intellectual Property Ownership"],
  ["confidentiality", "Confidentiality (NDA)"],
  ["cancellation_policy", "Cancellation Policy"],
  ["governing_law", "Governing Law"],
  ["limitation_of_liability", "Limitation of Liability"],
];
const DEFAULT_CLAUSES = AGREEMENT_CLAUSES.reduce((acc, [key]) => ({ ...acc, [key]: true }), {});

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
    total_visitors: data?.totalVisitors ?? data?.total_visitors ?? null,
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
  const normalized = LEGACY_STATUS_MAP[status] || status;
  const index = LEAD_JOURNEY.findIndex((stage) => stage.status === normalized);
  return index >= 0 ? index : 0;
}

function statusLabel(status) {
  const normalized = LEGACY_STATUS_MAP[status] || status;
  return STATUS_LABELS[normalized] || labelize(status);
}

function renderValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (isValidElement(value)) return value;
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);
  if (Array.isArray(value)) return value.map((item) => renderValue(item)).join(", ");
  return value?.name || value?.label || value?.title || "-";
}

function buildStageNotes(stage, values) {
  const lines = [`${stage.label} completed.`];
  stage.fields.forEach((field) => {
    const value = String(values?.[field.key] || "").trim();
    if (value) lines.push(`${field.label}: ${value}`);
  });
  return lines.join("\n");
}

function buildAgreementPayload(lead, values) {
  const clauses = values?.clauses_enabled || DEFAULT_CLAUSES;
  const projectTitle = values?.project_title || values?.project_name || lead?.subject || lead?.service || "DortX Software Project";
  const clientDetails = [lead?.name, lead?.company, lead?.email, lead?.phone, values?.address].filter(Boolean).join("\n");
  return {
    lead_id: lead?.id,
    client_name: values?.client_name || lead?.name || "",
    company: values?.company || lead?.company || "",
    email: values?.email || lead?.email || "",
    phone: values?.phone || lead?.phone || "",
    address: values?.address || "",
    project_title: projectTitle,
    project_name: projectTitle,
    service_wing: values?.service_wing || lead?.service || "",
    project_type: values?.service_wing || lead?.service || "",
    project_description: values?.project_description || lead?.description || "",
    scope_of_work: values?.scope_of_work || "",
    project_scope: values?.scope_of_work || "",
    deliverables: values?.deliverables || "",
    included_deliverables: values?.deliverables || "",
    technology_stack: values?.technology_stack || "",
    project_timeline: values?.project_timeline || lead?.timeline || "",
    timeline: values?.project_timeline || lead?.timeline || "",
    support_duration: values?.support_duration || values?.warranty_period || "30 days post-launch support",
    support_period: values?.support_duration || values?.warranty_period || "30 days post-launch support",
    warranty_period: values?.warranty_period || "30 days defect warranty and support period",
    special_notes: values?.special_notes || "",
    milestones: values?.milestones || "",
    expected_delivery_date: values?.expected_delivery_date || "",
    project_cost: values?.project_cost || "",
    total_project_cost: values?.project_cost || "",
    advance_payment: values?.advance_payment || "",
    remaining_amount: values?.remaining_amount || "",
    payment_schedule: values?.payment_schedule || "Advance payment before project kickoff and balance payment before final handover unless otherwise agreed in writing.",
    additional_charges: values?.additional_charges || "",
    late_payment_terms: values?.late_payment_terms || "Late payments may pause delivery timelines until dues are cleared.",
    currency: values?.currency || "INR",
    clauses_enabled: clauses,
    confidentiality: clauses.confidentiality ? "Both parties agree to protect confidential project, business and technical information shared during the engagement." : "",
    intellectual_property: clauses.intellectual_property ? "Final approved deliverables and agreed source code ownership transfer according to the accepted commercial terms after payment completion." : "",
    change_request_policy: clauses.change_request_policy ? "Changes outside the accepted scope require written approval and may affect pricing and delivery timelines." : "",
    refund_policy: clauses.refund_policy ? "Refunds are not available for completed work, booked resources, approved milestones, third-party costs, or work already delivered unless DortX Technologies approves an exception in writing." : "",
    cancellation_policy: clauses.cancellation_policy ? "Cancellation requests must be communicated in writing. Work completed, booked resources and third-party costs remain payable." : "",
    governing_law: clauses.governing_law ? "This agreement is governed by applicable laws in India." : "",
    limitation_of_liability: clauses.limitation_of_liability ? "DortX Technologies is not liable for indirect, incidental, consequential, special, punitive, business interruption, data loss, or lost-profit damages. Total liability is limited to amounts paid for the affected service." : "",
    client_responsibilities: "The client will provide timely approvals, content, access, feedback and business inputs required for delivery.",
    dortx_responsibilities: "DortX Technologies will deliver the agreed scope with professional care, transparent communication and reasonable technical diligence.",
    client_details: clientDetails,
  };
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
  const hasValue = value !== null && value !== undefined;
  const [display, setDisplay] = useState(() => toMetricNumber(value));
  const displayRef = useRef(display);

  useEffect(() => {
    if (!hasValue) return undefined;
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
  }, [value, hasValue]);

  if (!hasValue) return <>...</>;
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
  const [emailSettings, setEmailSettings] = useState(null);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const [me, analytics, leadResponse, applicationResponse, subscriberResponse, liveResponse, projectsResponse, emailResponse] = await Promise.allSettled([
        adminApiClient.get("/auth/me"),
        adminApiClient.get("/admin/analytics"),
        adminApiClient.get(`/admin/leads?status=${status}&q=${encodeURIComponent(q)}&page=${page}&limit=20`),
        adminApiClient.get("/admin/applications"),
        adminApiClient.get("/admin/newsletter"),
        adminApiClient.get("/admin/live-metrics"),
        adminApiClient.get("/projects?archived=false&page=1&limit=100"),
        adminApiClient.get("/admin/email-settings"),
      ]);

      if ([me, analytics, leadResponse, applicationResponse, subscriberResponse, liveResponse, projectsResponse, emailResponse].some(isUnauthorized)) {
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

      if (emailResponse.status === "fulfilled") {
        setEmailSettings(emailResponse.value?.data || null);
      } else {
        errors.push(`Email: ${getBackendError(emailResponse.reason, "Could not load email configuration.")}`);
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
    const agreementDefaults = stage.status === "agreement_generated" ? {
      client_name: selected?.name || "",
      company: selected?.company || "",
      email: selected?.email || "",
      phone: selected?.phone || "",
      project_title: selected?.subject || selected?.service || "DortX Software Project",
      service_wing: selected?.service || "",
      project_description: selected?.description || "",
      project_timeline: selected?.timeline || "",
      warranty_period: "30 days defect warranty and support period",
      special_notes: "",
      currency: "INR",
      clauses_enabled: DEFAULT_CLAUSES,
    } : {};
    setWorkflowDraft({ ...agreementDefaults, ...existing, clauses_enabled: { ...(agreementDefaults.clauses_enabled || {}), ...(existing.clauses_enabled || {}) } });
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

  const testEmailConnection = async () => {
    setEmailTesting(true);
    setEmailMessage("");
    try {
      const response = await adminApiClient.post("/admin/email-settings/test-connection");
      setEmailSettings(response.data);
      setEmailMessage(response.data?.connected ? "SMTP connection verified." : response.data?.message || "SMTP connection failed.");
    } catch (error) {
      setEmailMessage(getBackendError(error, "Could not verify SMTP connection."));
    } finally {
      setEmailTesting(false);
    }
  };

  const sendTestEmail = async () => {
    setEmailTesting(true);
    setEmailMessage("");
    try {
      const response = await adminApiClient.post("/admin/email-settings/send-test", { recipient: admin.email || "thrisha@dortxtech.com" });
      setEmailSettings(response.data);
      setEmailMessage(`Test email sent to ${response.data?.last_test_recipient || admin.email || "administrator"}.`);
    } catch (error) {
      setEmailMessage(getBackendError(error, "Could not send test email."));
    } finally {
      setEmailTesting(false);
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
    const nextStatus = nextStage.status;
    setWorkflowSaving(true);
    setWorkflowMessage("");
    try {
      if (currentStage.status === "agreement_generated") {
        const agreementPayload = buildAgreementPayload(selected, workflowDraft);
        const agreementResponse = await adminApiClient.post("/agreements", agreementPayload);
        const agreementId = agreementResponse.data?.id || agreementResponse.data?.agreement_id;
        const sendResponse = await adminApiClient.post(`/agreements/${agreementId}/send`);
        const leadResponse = await adminApiClient.get(`/leads/${selected.id}`);
        const updatedLead = leadResponse.data || selected;
        setSelected(updatedLead);
        setLeads((items) => items.map((lead) => (lead?.id === updatedLead.id ? updatedLead : lead)));
        await fetchAll();
        setWorkflowMessage(`Agreement ${sendResponse.data?.agreement_number || agreementId || ""} sent to ${sendResponse.data?.email_recipient || agreementPayload.email}.`);
        return;
      }
      const payload = {
        status: nextStatus,
        notes: buildStageNotes(currentStage, workflowDraft),
        data: workflowDraft,
      };
      const response = await adminApiClient.patch(`/admin/leads/${selected.id}/status`, payload);
      const updatedLead = response.data?.lead || selected;
      setSelected(updatedLead);
      setLeads((items) => items.map((lead) => (lead?.id === updatedLead.id ? updatedLead : lead)));
      await fetchAll();
      if (nextStatus === "project_started") {
        setWorkflowMessage("Project Started. A project record has been created.");
      } else {
        setWorkflowMessage(`${currentStage.label} completed. ${nextStage.label} is now active.`);
      }
    } catch (error) {
      console.error("Lead workflow update failed", error);
      await refreshSelectedLead();
      setWorkflowMessage(getBackendError(error, "Could not complete this stage. Please try again."));
    } finally {
      setWorkflowSaving(false);
    }
  };

  const refreshSelectedLead = async () => {
    if (!selected?.id) return;
    const response = await adminApiClient.get(`/leads/${selected.id}`);
    const updatedLead = response.data || selected;
    setSelected(updatedLead);
    setLeads((items) => items.map((lead) => (lead?.id === updatedLead.id ? updatedLead : lead)));
    await fetchAll();
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
  const selectedStatusClass = STATUS_COLOR[LEGACY_STATUS_MAP[selected?.status] || selected?.status] ?? STATUS_COLOR.new;
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
            { k: "settings", label: "Settings", Icon: Settings },
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
                          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_COLOR[LEGACY_STATUS_MAP[l?.status] || l?.status] ?? STATUS_COLOR.new}`}>{statusLabel(l?.status || "new")}</span>
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
                          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_COLOR[project?.status] ?? STATUS_COLOR.not_started}`}>{statusLabel(project?.status || "not_started")}</span>
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
                          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_COLOR[a?.status] ?? STATUS_COLOR.new}`}>{statusLabel(a?.status || "new")}</span>
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
                <Users size={14} className="text-[#4D8BFF]"/> Total Visitors
              </div>
              <div className="mt-4 font-display text-[32px] font-semibold text-white tabular-nums"><AnimatedMetricNumber value={liveMetrics.total_visitors}/></div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#9AA3B8]">
                Persistent MongoDB counter
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

        {tab === "settings" && (
          <div className="mt-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-4" data-testid="email-settings-panel">
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[#6B7385]">
                    <Mail size={14} className="text-[#4D8BFF]"/> Email Configuration
                  </div>
                  <div className="mt-2 font-display text-[22px] font-semibold text-white">Hostinger SMTP</div>
                  <div className="mt-1 text-[13px] text-[#9AA3B8]">Agreement emails are sent from the official DortX business email.</div>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${
                  emailSettings?.connected
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                    : "border-amber-500/25 bg-amber-500/10 text-amber-200"
                }`}>
                  {emailSettings?.connected ? "Connected" : statusLabel(emailSettings?.status || "unchecked")}
                </span>
              </div>

              {!emailSettings?.connected && (
                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-100">
                  {emailSettings?.message || "SMTP is not verified. Add Hostinger SMTP credentials in the environment and test the connection."}
                </div>
              )}

              <div className="mt-6 grid sm:grid-cols-2 gap-4 text-[13.5px]">
                <Info l="Provider" v={emailSettings?.provider || "Hostinger SMTP"}/>
                <Info l="From Email" v={emailSettings?.from_email || "thrisha@dortxtech.com"}/>
                <Info l="SMTP Host" v={emailSettings?.host || "smtp.hostinger.com"}/>
                <Info l="Port / Security" v={`${emailSettings?.port || 465} / ${emailSettings?.secure === false ? "STARTTLS" : "SSL/TLS"}`}/>
                <Info l="Username" v={emailSettings?.username || "thrisha@dortxtech.com"}/>
                <Info l="Last Test" v={emailSettings?.last_test_at ? formatDate(emailSettings.last_test_at, "datetime") : "-"}/>
              </div>

              {emailSettings?.last_test_recipient && (
                <div className="mt-4 text-[12.5px] text-[#9AA3B8]">
                  Last test recipient: <span className="text-[#C9D2E0]">{emailSettings.last_test_recipient}</span>
                </div>
              )}
              {emailSettings?.last_test_error && (
                <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-100">
                  {emailSettings.last_test_error}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={testEmailConnection} disabled={emailTesting} className="btn-ghost !py-2.5 !px-4 !text-[13px] disabled:opacity-60">
                  <RefreshCw size={14}/> {emailTesting ? "Testing..." : "Test SMTP Connection"}
                </button>
                <button onClick={sendTestEmail} disabled={emailTesting} className="btn-primary !py-2.5 !px-5 !text-[13px] disabled:opacity-60">
                  <Send size={14}/> {emailTesting ? "Sending..." : "Send Test Email"}
                </button>
              </div>
              {emailMessage && <div className="mt-4 text-[13px] text-[#C9D2E0]">{emailMessage}</div>}
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[#6B7385]">
                <ShieldCheck size={14} className="text-[#4D8BFF]"/> Secure Deployment
              </div>
              <div className="mt-3 space-y-3 text-[13.5px] leading-relaxed text-[#C9D2E0]">
                <p>SMTP credentials are read only from environment variables. The Hostinger password is never shown in the dashboard and should stay in local `.env` or the deployment provider environment settings.</p>
                <p>Agreement sending verifies the SMTP connection first. If Hostinger rejects the connection or both 465 and 587 fail, the agreement remains Draft and Resend Agreement stays available.</p>
              </div>
              <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4 text-[12.5px] text-[#9AA3B8]">
                Required variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_SECURE`, `EMAIL_FROM`, `EMAIL_FROM_NAME`.
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
              onLeadRefresh={refreshSelectedLead}
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
              <span className={`text-[11px] px-2.5 py-1 rounded-full border ${selectedApplicationStatusClass}`}>{statusLabel(selectedApplication?.status || "new")}</span>
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
      <div className="text-white mt-1">{renderValue(v)}</div>
    </div>
  );
}

function LeadWorkflow({ lead, draft, saving, message, onDraftChange, onComplete, onLeadRefresh, onDelete }) {
  const [agreementPreviewOpen, setAgreementPreviewOpen] = useState(false);
  const [agreementPreviewed, setAgreementPreviewed] = useState(false);
  const activeIndex = journeyIndex(lead?.status);
  const activeStage = LEAD_JOURNEY[activeIndex];
  const normalizedStatus = LEGACY_STATUS_MAP[lead?.status] || lead?.status;
  const isCompleted = normalizedStatus === "completed";
  const isAgreementBuilder = activeStage.status === "agreement_generated";
  const isAgreementReview = ["agreement_sent", "client_signed", "dortx_signed"].includes(activeStage.status);

  useEffect(() => {
    setAgreementPreviewOpen(false);
    setAgreementPreviewed(false);
  }, [lead?.id, activeStage.status]);

  return (
    <div className="mt-6 grid lg:grid-cols-[0.85fr_1.15fr] gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <div className="font-display text-[16px] font-semibold text-white">Lead Journey</div>
        <div className="mt-4 space-y-2">
          {LEAD_JOURNEY.map((stage, index) => {
            const completed = index < activeIndex || (isCompleted && stage.status === "completed");
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

        <LeadActivityFeed lead={lead}/>

        <div className="rounded-2xl border border-[#1E6BFF]/25 bg-[#061225]/75 p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#6B7385]">Current stage</div>
              <div className="font-display text-[20px] font-semibold text-white mt-1">{activeStage.label}</div>
            </div>
            <div className="text-[12px] text-[#9AA3B8]">{activeIndex + 1} of {LEAD_JOURNEY.length}</div>
          </div>

          {isAgreementBuilder ? (
            <AgreementBuilder
              lead={lead}
              draft={draft}
              onDraftChange={onDraftChange}
              onPreview={() => {
                setAgreementPreviewed(true);
                setAgreementPreviewOpen(true);
              }}
            />
          ) : isAgreementReview ? (
            <AgreementAdminReview lead={lead} onLeadRefresh={onLeadRefresh}/>
          ) : (
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
                      disabled={isCompleted}
                    />
                  ) : (
                    <input
                      value={draft?.[field.key] || ""}
                      onChange={(event) => onDraftChange(field.key, event.target.value)}
                      className="contact-field mt-2"
                      placeholder={field.label}
                      disabled={isCompleted}
                    />
                  )}
                </label>
              ))}
            </div>
          )}

          {message && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-[#C9D2E0]">{message}</div>}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={onComplete}
              disabled={saving || isCompleted || activeStage.status === "client_signed" || (isAgreementBuilder && !agreementPreviewed)}
              className="btn-primary !py-2.5 !px-5 !text-[13px] disabled:opacity-50"
            >
              <CheckCircle2 size={14}/> {saving ? "Saving..." : isCompleted ? "Completed" : activeStage.status === "client_signed" ? "Waiting for DortX Signature" : isAgreementBuilder ? (agreementPreviewed ? "Send Agreement Link" : "Preview Required") : activeStage.status === "dortx_signed" ? "Move to Advance Paid" : activeStage.status === "project_started" ? "Mark Project Started" : activeStage.status === "completed" ? "Mark Completed" : "Complete Stage"}
            </button>
            <button onClick={onDelete} className="ml-auto px-3 py-1.5 rounded-full text-[12px] border border-red-500/30 text-red-300 hover:bg-red-500/10">
              <Trash2 size={12} className="inline mr-1"/>Delete
            </button>
          </div>
        </div>
      </div>
      {agreementPreviewOpen && (
        <AgreementPreviewModal
          lead={lead}
          draft={draft}
          onClose={() => setAgreementPreviewOpen(false)}
        />
      )}
    </div>
  );
}

function LeadActivityFeed({ lead }) {
  const entries = toArray(lead?.status_history || lead?.statusHistory).slice().reverse().slice(0, 6);
  if (!entries.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 font-display text-[15px] font-semibold text-white"><Activity size={15} className="text-[#4D8BFF]"/>Activity Feed</div>
      <div className="mt-3 space-y-2.5">
        {entries.map((entry, index) => (
          <div key={`${entry.created_at || entry.date || index}-${index}`} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[13px] font-medium text-white">{statusLabel(entry.new_status || entry.status || lead?.status)}</div>
              <div className="text-[11.5px] text-[#6B7385]">{formatDate(entry.created_at, "datetime") || entry.date || "-"}</div>
            </div>
            {entry.notes && <div className="mt-1 text-[12.5px] leading-relaxed text-[#9AA3B8]">{entry.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgreementBuilder({ lead, draft, onDraftChange, onPreview }) {
  const textFields = [
    ["project_title", "Project Title", "text"],
    ["project_description", "Project Description", "textarea"],
    ["scope_of_work", "Scope of Work", "textarea"],
    ["deliverables", "Deliverables", "textarea"],
    ["project_timeline", "Project Timeline", "text"],
    ["project_cost", "Project Cost"],
    ["warranty_period", "Warranty / Support Period", "text"],
    ["special_notes", "Special Notes", "textarea"],
  ];

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-2xl border border-[#4D8BFF]/20 bg-gradient-to-br from-[#081B36]/90 to-black/30 p-4 shadow-[0_0_36px_rgba(30,107,255,0.12)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo height={30} linkTo=""/>
            <div>
              <div className="font-display text-[19px] font-semibold text-white">Digital Service Agreement</div>
              <div className="text-[12px] text-[#9AA3B8]">Agreement number is generated automatically after saving.</div>
            </div>
          </div>
          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-200">Pending Review</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {[
          ["client_name", "Client Name", lead?.name],
          ["company", "Company", lead?.company],
          ["email", "Email", lead?.email],
          ["phone", "Phone", lead?.phone],
          ["address", "Address", ""],
        ].map(([key, label, fallback]) => (
          <label key={key} className={key === "address" ? "md:col-span-2" : ""}>
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385]">{label}</span>
            <input value={draft?.[key] ?? fallback ?? ""} onChange={(event) => onDraftChange(key, event.target.value)} className="contact-field mt-2" placeholder={label}/>
          </label>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {textFields.map(([key, label, type]) => (
          <label key={key} className={type === "textarea" ? "md:col-span-2" : ""}>
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385]">{label}</span>
            {type === "textarea" ? (
              <textarea value={draft?.[key] || ""} onChange={(event) => onDraftChange(key, event.target.value)} className="contact-field mt-2 min-h-[92px]" placeholder={label}/>
            ) : (
              <input value={draft?.[key] || ""} onChange={(event) => onDraftChange(key, event.target.value)} className="contact-field mt-2" placeholder={label}/>
            )}
          </label>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-2 text-white font-semibold"><ShieldCheck size={15}/> Included legal framework</div>
        <div className="mt-1 text-[12.5px] text-[#9AA3B8]">All clauses below are included in the Digital Service Agreement by default.</div>
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {AGREEMENT_CLAUSES.map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2 text-[12.5px] text-[#C9D2E0]">
              <CheckCircle2 size={13} className="text-emerald-300"/>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385]">DortX Information</div>
        <div className="mt-2 grid sm:grid-cols-2 gap-2 text-[13px] text-[#C9D2E0]">
          <div>DortX Technologies</div>
          <div>https://www.dortxtech.com</div>
          <div>MSME: UDYAM-KR-25-0108099</div>
          <div>Authorized Signatory: Thrisha J C</div>
        </div>
      </div>
      <button type="button" onClick={onPreview} className="btn-ghost !py-2.5 !px-5 !text-[13px]">
        <FileText size={14}/> Preview Agreement
      </button>
    </div>
  );
}

function AgreementPreviewModal({ lead, draft, onClose }) {
  const agreement = buildAgreementPayload(lead, draft);
  const legalSections = [
    ["Scope of Work", agreement.scope_of_work || agreement.project_scope],
    ["Deliverables", agreement.deliverables || agreement.included_deliverables],
    ["Timeline", agreement.project_timeline || agreement.timeline],
    ["Payment Terms", `Project Cost: ${agreement.project_cost || "-"} ${agreement.currency || ""}\nAdvance: ${agreement.advance_payment || "-"}\nRemaining: ${agreement.remaining_amount || "-"}\nPayment Schedule: ${agreement.payment_schedule || "-"}\nLate Payment Terms: ${agreement.late_payment_terms || "-"}`],
    ["Confidentiality", agreement.confidentiality],
    ["Intellectual Property", agreement.intellectual_property],
    ["Warranty", agreement.warranty_period],
    ["Privacy Policy", "DortX Technologies will handle client information, project materials, account details, and contact data for lawful project delivery, communication, billing, support, and compliance purposes."],
    ["Terms & Conditions", `The client agrees to the DortX Technologies engagement terms, service responsibilities, approval requirements, payment obligations, change request policy, cancellation policy and refund policy contained in this Agreement.\n\nChange Requests: ${agreement.change_request_policy || "-"}\nCancellation: ${agreement.cancellation_policy || "-"}\nRefund Policy: ${agreement.refund_policy || "-"}`],
    ["Governing Law", agreement.governing_law],
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-end sm:items-center justify-center p-4">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Agreement preview"
        initial={{ y: 28, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/10 bg-[#05080F] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-display text-[20px] font-semibold text-white">Agreement Preview</div>
            <div className="mt-1 text-[12.5px] text-[#9AA3B8]">Review this legal document before sending the client link.</div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#9AA3B8] hover:bg-white/5 hover:text-white" aria-label="Close">
            <X size={16}/>
          </button>
        </div>

        <article className="mx-auto min-h-[1120px] max-w-[900px] bg-white px-7 py-8 text-[#111827] shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:px-14 sm:py-14 lg:px-20">
          <header className="border-b-2 border-[#111827] pb-8">
            <div className="grid gap-6 md:grid-cols-[1fr_1.45fr_1fr] md:items-start">
              <Logo height={38} linkTo=""/>
              <div className="md:text-center">
                <div className="text-[15px] font-semibold uppercase tracking-[0.22em] text-[#374151]">DortX Technologies</div>
                <div className="mt-3 font-display text-[40px] font-semibold leading-tight text-[#111827]">Digital Service Agreement</div>
              </div>
              <div className="text-[13px] leading-relaxed text-[#526071] md:text-right">
                <div><span className="font-semibold text-[#111827]">Agreement:</span> Auto-generated</div>
                <div><span className="font-semibold text-[#111827]">Status:</span> Preview</div>
              </div>
            </div>
          </header>

          <div className="pt-10">
            <div className="border-y border-[#D1D5DB] py-5">
              <p className="text-[16px] leading-[1.8] text-[#374151]">
                This Digital Service Agreement is issued by DortX Technologies for the service wing identified as <strong className="font-semibold text-[#111827]">{agreement.service_wing || agreement.project_type || "Software Development"}</strong>. The Agreement records the commercial, technical, legal and execution terms governing the project titled <strong className="font-semibold text-[#111827]">{agreement.project_title || agreement.project_name || "Not specified"}</strong>.
              </p>
            </div>

            <div className="mt-10 space-y-10">
              <PreviewSection title="Company Information">
                DortX Technologies{"\n"}Website: https://www.dortxtech.com{"\n"}Email: support@dortxtech.com{"\n"}MSME Registration: UDYAM-KR-25-0108099
              </PreviewSection>
              <PreviewSection title="Client Information">
                {`Client Name: ${agreement.client_name || "-"}\nCompany: ${agreement.company || "-"}\nEmail: ${agreement.email || "-"}\nPhone: ${agreement.phone || "-"}\nAddress: ${agreement.address || "-"}`}
              </PreviewSection>
              <PreviewSection title="Project Details">{`Project Title: ${agreement.project_title || agreement.project_name || "-"}\nService Wing: ${agreement.service_wing || agreement.project_type || "Software Development"}\n\n${agreement.project_description || "-"}`}</PreviewSection>
              {legalSections.map(([title, body], index) => (
                <PreviewSection key={title} title={title}>{body || "-"}</PreviewSection>
              ))}
              <PreviewSection title="Digital Signatures">
                By signing this Agreement electronically, the Client confirms that the Agreement has been reviewed and accepted. DortX Technologies shall execute the Agreement through its authorized signatory after client acceptance.
              </PreviewSection>
            </div>

            <div className="mt-10 border-t border-[#D1D5DB] pt-7">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">For and on behalf of</div>
              <div className="mt-2 font-display text-[24px] font-semibold uppercase tracking-[0.08em] text-[#111827]">DortX Technologies</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 text-[16px] leading-[1.8] text-[#374151]">
                <div>Authorized Signatory: Thrisha J C</div>
                <div>Founder & Chief Executive Officer (CEO)</div>
                <div>MSME Registration: UDYAM-KR-25-0108099</div>
                <div>Status: Waiting for DortX Signature</div>
              </div>
            </div>
          </div>
        </article>
      </motion.div>
    </motion.div>
  );
}

function PreviewSection({ title, children }) {
  return (
    <section className="break-inside-avoid">
      <h3 className="font-display text-[24px] font-semibold leading-tight text-[#111827]">{title}</h3>
      <p className="mt-3 whitespace-pre-wrap text-[16px] leading-[1.8] text-[#374151]">{children}</p>
    </section>
  );
}

function AgreementAdminReview({ lead, onLeadRefresh }) {
  const [agreement, setAgreement] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [founderSignature, setFounderSignature] = useState(() => localStorage.getItem("dortx-founder-signature") || "");

  const load = useCallback(async () => {
    if (!lead?.id) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await adminApiClient.get(`/agreements?lead_id=${lead.id}`);
      setAgreement(toArray(response.data?.items)[0] || null);
    } catch (error) {
      console.error("Agreement load failed", error);
      setMessage("Could not load agreement.");
    } finally {
      setLoading(false);
    }
  }, [lead?.id]);

  useEffect(() => { load(); }, [load]);

  const locked = Boolean(agreement?.locked || (agreement?.client_signed && agreement?.dortx_signed));
  const canSign = Boolean(agreement?.id && agreement?.client_signed && !agreement?.dortx_signed);
  const canResend = Boolean(agreement?.id && !agreement?.client_signed && agreement?.email_status !== "sent");
  const deliveryStatus = agreement?.email_status || "draft";

  const uploadFounderSignature = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setFounderSignature(dataUrl);
      localStorage.setItem("dortx-founder-signature", dataUrl);
      setMessage("Founder signature saved for future agreements.");
    };
    reader.readAsDataURL(file);
  };

  const signDortx = async () => {
    if (!agreement?.id) return;
    setLoading(true);
    setMessage("");
    try {
      const savedSignature = founderSignature || "Thrisha J C";
      const response = await adminApiClient.patch(`/agreements/${agreement.id}/sign-dortx`, {
        name: "Thrisha J C",
        designation: "Founder & Chief Executive Officer (CEO)",
        signature_type: savedSignature.startsWith("data:image") ? "stored_image" : "typed",
        signature: savedSignature,
      });
      setAgreement(response.data);
      setMessage(response.data?.client_signed ? "Agreement executed. Signed PDF generated." : "DortX signature saved. Waiting for client signature.");
      await onLeadRefresh?.();
      await load();
    } catch (error) {
      console.error("DortX agreement signature failed", error);
      setMessage(getBackendError(error, "Could not sign agreement. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const resendAgreement = async () => {
    if (!agreement?.id) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await adminApiClient.post(`/agreements/${agreement.id}/send`);
      setAgreement(response.data);
      setMessage(`Agreement email sent to ${response.data?.email_recipient || response.data?.email || "client"}.`);
      await onLeadRefresh?.();
      await load();
    } catch (error) {
      console.error("Agreement resend failed", error);
      setMessage(getBackendError(error, "Could not resend the agreement email."));
      await load();
    } finally {
      setLoading(false);
    }
  };

  const downloadAgreementPdf = async () => {
    if (!agreement?.id) return;
    setMessage("");
    try {
      const response = await adminApiClient.get(`/documents/agreement/${agreement.id}/download`, { responseType: "blob" });
      downloadBlob(response.data, `agreement-${agreement.id}.pdf`);
    } catch (error) {
      console.error("Agreement PDF download failed", error);
      setMessage(getBackendError(error, "Could not download the agreement PDF."));
    }
  };

  const publicPath = agreement?.client_url || (agreement?.agreement_token ? `/agreement/${agreement.agreement_token}` : agreement?.id ? `/agreement/${agreement.id}` : "");

  return (
    <div className="mt-5 rounded-2xl border border-[#4D8BFF]/20 bg-gradient-to-br from-[#07172D]/90 via-[#08101D]/95 to-black/50 p-4 shadow-[0_0_36px_rgba(30,107,255,0.12)]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-white font-semibold"><FileSignature size={16}/> Agreement Review</div>
          <div className="mt-1 text-[12.5px] text-[#9AA3B8]">{agreement?.agreement_number || agreement?.id || "Agreement not generated yet"}</div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#C9D2E0]">{statusLabel(agreement?.status || "pending")}</span>
      </div>
      {message && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-[#C9D2E0]">{message}</div>}
      {agreement && (
        <>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <SignatureStatus label="Client Signed" done={agreement.client_signed}/>
            <SignatureStatus label="DortX Signed" done={agreement.dortx_signed}/>
            <SignatureStatus label="Executed" done={locked}/>
          </div>
          {agreement.client_signed && (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[12.5px] text-emerald-100">
              Client signed at {formatDate(agreement.client_signed_at, "datetime")}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-white font-semibold"><Mail size={15}/> Email Delivery</div>
                <div className="mt-1 text-[12.5px] text-[#9AA3B8]">Agreement emails are sent from thrisha@dortxtech.com through the configured SMTP transport.</div>
              </div>
              <span className={`w-fit rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${
                deliveryStatus === "sent"
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                  : deliveryStatus === "failed"
                    ? "border-red-500/25 bg-red-500/10 text-red-200"
                    : "border-amber-500/25 bg-amber-500/10 text-amber-200"
              }`}>
                {deliveryStatus === "sent" ? "Email Sent ✓" : statusLabel(deliveryStatus)}
              </span>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3 text-[13px] text-[#DCE8FF]">
              <Info l="Sent Time" v={agreement.email_sent_at ? formatDate(agreement.email_sent_at, "datetime") : "-"}/>
              <Info l="Recipient" v={agreement.email_recipient || agreement.email}/>
              <Info l="Delivery Status" v={deliveryStatus === "sent" ? "Sent" : statusLabel(deliveryStatus)}/>
            </div>
            {agreement.email_message_id && <div className="mt-3 text-[11.5px] text-[#6B7385] break-all">Message ID: {agreement.email_message_id}</div>}
            {agreement.email_last_error && (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-100">
                {agreement.email_last_error}
              </div>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-[#F6D987]/20 bg-[#120F08]/45 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#F6D987]">For and on behalf of</div>
            <div className="mt-2 font-display text-[20px] font-semibold text-white">DortX Technologies</div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-[13px] text-[#DCE8FF]">
              <Info l="Authorized Signatory" v="Thrisha J C"/>
              <Info l="Designation" v="Founder & Chief Executive Officer (CEO)"/>
              <Info l="MSME Registration" v="UDYAM-KR-25-0108099"/>
              <Info l="Client Page" v={<a href={publicPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#6EA0FF] hover:text-white"><ExternalLink size={12}/> Open agreement</a>}/>
            </div>
          </div>

          {!agreement.dortx_signed && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-white font-semibold">Founder Profile Signature</div>
                  <div className="mt-1 text-[12.5px] text-[#9AA3B8]">{founderSignature ? "Saved founder signature will be inserted automatically when you approve." : "Upload the founder signature once. It will be reused for future agreements."}</div>
                </div>
                <div className="flex rounded-xl bg-black/25 p-1">
                  <label className="cursor-pointer rounded-lg px-3 py-2 text-[12px] text-[#9AA3B8] hover:text-white">
                    Upload / Replace
                    <input type="file" accept="image/*" onChange={uploadFounderSignature} className="hidden"/>
                  </label>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
                {founderSignature ? <img src={founderSignature} alt="Stored founder signature" className="max-h-[120px] object-contain"/> : <div className="flex items-center gap-2 text-[13px] text-[#9AA3B8]"><Upload size={14}/> No stored founder signature yet. Typed fallback: Thrisha J C.</div>}
              </div>
            </div>
          )}
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {canResend && (
          <button onClick={resendAgreement} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#4D8BFF]/30 bg-[#1E6BFF]/10 text-[13px] text-[#CFE0FF] hover:bg-[#1E6BFF]/18 disabled:opacity-50">
            <Send size={14}/>{loading ? "Sending..." : "Resend Agreement"}
          </button>
        )}
        <button onClick={signDortx} disabled={loading || !canSign} className="btn-primary !py-2.5 !px-5 !text-[13px] disabled:opacity-50">
          <PenLine size={14}/> {loading ? "Working..." : agreement?.dortx_signed ? "DortX Signed" : "Approve & Sign"}
        </button>
        {agreement?.pdf_path && (
          <button onClick={downloadAgreementPdf} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 text-[13px] text-[#C9D2E0] hover:bg-white/5"><Download size={14}/>Download Signed PDF</button>
        )}
      </div>
    </div>
  );
}

function SignatureStatus({ label, done }) {
  return (
    <div className={`rounded-xl border p-3 ${done ? "border-emerald-500/20 bg-emerald-500/10" : "border-white/8 bg-white/[0.025]"}`}>
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385]">{label}</div>
      <div className={`mt-1 flex items-center gap-1.5 text-[13px] ${done ? "text-emerald-200" : "text-white"}`}>
        {done && <CheckCircle2 size={14}/>}
        {done ? "Yes" : "Pending"}
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
