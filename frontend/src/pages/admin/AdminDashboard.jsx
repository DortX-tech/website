import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Download, LogOut, Trash2, RefreshCw, Users, Mail, Briefcase, Send, LayoutDashboard, Inbox, FileText, UserCog } from "lucide-react";
import Logo from "@/components/Logo";
import TeamManager from "@/pages/admin/TeamManager";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
const STATUSES = ["all", "new", "contacted", "qualified", "won", "lost"];
const STATUS_COLOR = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  qualified: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  lost: "bg-red-500/15 text-red-300 border-red-500/30",
};
const EMPTY_STATS = { total_leads: 0, by_status: {}, by_service: [], applications: 0, subscribers: 0 };

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function readListResponse(response, name, { paginated = false } = {}) {
  const data = response?.data;
  if (!data || !Array.isArray(data.items)) {
    throw new Error(`${name} response must include an items array`);
  }
  return {
    items: data.items,
    total: paginated ? toNumber(data.total, data.items.length) : toNumber(data.total, data.items.length),
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
  };
}

function formatDate(value, mode = "date") {
  if (!value) return "-";
  const next = new Date(value);
  if (Number.isNaN(next.getTime())) return "-";
  return mode === "datetime" ? next.toLocaleString() : next.toLocaleDateString();
}

function api() {
  const token = localStorage.getItem("dortx-admin-token") ?? "";
  return axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });
}

function StatCard({ icon: Icon, label, value, accent = "#4D8BFF" }) {
  const SafeIcon = Icon ?? LayoutDashboard;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <SafeIcon size={18} style={{ color: accent }}/>
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385]">{label}</span>
      </div>
      <div className="mt-4 font-display text-[28px] font-semibold text-white">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("leads");
  const [stats, setStats] = useState(EMPTY_STATS);
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [applications, setApplications] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const [a, l, apps, subs] = await Promise.all([
        api().get("/admin/analytics"),
        api().get(`/admin/leads?status=${status}&q=${encodeURIComponent(q)}&page=${page}&limit=20`),
        api().get("/admin/applications"),
        api().get("/admin/newsletter"),
      ]);
      const leadData = readListResponse(l, "Leads", { paginated: true });
      const applicationData = readListResponse(apps, "Applications");
      const subscriberData = readListResponse(subs, "Newsletter");

      setStats(readAnalyticsResponse(a));
      setLeads(leadData.items);
      setTotal(leadData.total);
      setApplications(applicationData.items);
      setSubscribers(subscriberData.items);
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.removeItem("dortx-admin-token");
        nav("/admin/login");
        return;
      }
      setStats(EMPTY_STATS);
      setLeads([]);
      setTotal(0);
      setApplications([]);
      setSubscribers([]);
      setError("Admin data could not be loaded. Showing empty results.");
    } finally {
      setBusy(false);
    }
  }, [status, q, page, nav]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logout = () => {
    localStorage.removeItem("dortx-admin-token");
    nav("/admin/login");
  };

  const updateStatus = async (id, s) => {
    if (!id) return;
    await api().patch(`/admin/leads/${id}/status`, { status: s });
    fetchAll();
    if (selected?.id === id) setSelected({ ...selected, status: s });
  };

  const remove = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this lead permanently?")) return;
    await api().delete(`/admin/leads/${id}`);
    setSelected(null);
    fetchAll();
  };

  const exportCsv = async () => {
    const res = await api().get("/admin/leads/export.csv", { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dortx_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const safeLeads = toArray(leads) ?? [];
  const safeApplications = toArray(applications) ?? [];
  const safeSubscribers = toArray(subscribers) ?? [];
  const safeServices = toArray(stats?.by_service) ?? [];
  const leadsCount = safeLeads?.length ?? 0;
  const applicationsCount = safeApplications?.length ?? 0;
  const subscribersCount = safeSubscribers?.length ?? 0;
  const servicesCount = safeServices?.length ?? 0;
  const selectedStatusClass = STATUS_COLOR[selected?.status] ?? STATUS_COLOR.new;

  return (
    <div className="min-h-screen bg-[#05080F] noise" data-testid="admin-dashboard">
      <header className="border-b border-white/8 sticky top-0 z-40 glass-strong">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo height={24}/>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#4D8BFF] hidden sm:block">Admin Console</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-[#9AA3B8] hidden md:block">{localStorage.getItem("dortx-admin-email") ?? ""}</span>
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
            { k: "applications", label: "Applications", Icon: FileText },
            { k: "newsletter", label: "Newsletter", Icon: Send },
            { k: "analytics", label: "Analytics", Icon: LayoutDashboard },
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
              <div className="flex items-center gap-2 flex-1 min-w-[240px] glass rounded-full px-4 py-2.5">
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
                        <td className="px-5 py-3 text-[#C9D2E0]">{l?.email || "-"}</td>
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

        {tab === "applications" && (
          <div className="mt-6 glass rounded-2xl overflow-hidden" data-testid="applications-panel">
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead className="bg-white/[0.03] text-[#9AA3B8] text-left">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Position</th>
                    <th className="px-5 py-3 font-medium hidden lg:table-cell">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {busy && (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-[#6B7385]">Loading applications...</td></tr>
                  )}
                  {applicationsCount === 0 && !busy && (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-[#6B7385]">No applications yet.</td></tr>
                  )}
                  {!busy && safeApplications.map((a, index) => (
                    <tr key={a?.id ?? index} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-3 text-white font-medium">{a?.name || "-"}</td>
                      <td className="px-5 py-3 text-[#C9D2E0]">{a?.email || "-"}</td>
                      <td className="px-5 py-3 text-[#9AA3B8] hidden md:table-cell">{a?.position || "-"}</td>
                      <td className="px-5 py-3 text-[#6B7385] hidden lg:table-cell">{formatDate(a?.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "newsletter" && (
          <div className="mt-6 glass rounded-2xl overflow-hidden" data-testid="newsletter-panel">
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead className="bg-white/[0.03] text-[#9AA3B8] text-left">
                  <tr>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Source</th>
                    <th className="px-5 py-3 font-medium hidden lg:table-cell">Subscribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {busy && (
                    <tr><td colSpan={3} className="px-5 py-10 text-center text-[#6B7385]">Loading subscribers...</td></tr>
                  )}
                  {subscribersCount === 0 && !busy && (
                    <tr><td colSpan={3} className="px-5 py-10 text-center text-[#6B7385]">No subscribers yet.</td></tr>
                  )}
                  {!busy && safeSubscribers.map((s, index) => (
                    <tr key={s?.id ?? index} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-3 text-white">{s?.email || "-"}</td>
                      <td className="px-5 py-3 text-[#9AA3B8] hidden md:table-cell">{s?.source || "-"}</td>
                      <td className="px-5 py-3 text-[#6B7385] hidden lg:table-cell">{formatDate(s?.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="mt-6 grid lg:grid-cols-2 gap-4" data-testid="analytics-panel">
            <div className="glass rounded-2xl p-6">
              <div className="font-display text-[15px] text-white font-semibold mb-4">Leads by status</div>
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
          <motion.div initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-strong rounded-2xl max-w-2xl w-full p-7 max-h-[85vh] overflow-y-auto" data-testid="lead-detail-modal">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-[22px] font-semibold text-white">{selected?.name || "Lead"}</div>
                {selected?.email ? (
                  <a href={`mailto:${selected.email}`} className="text-[13.5px] text-[#4D8BFF]">{selected.email}</a>
                ) : (
                  <div className="text-[13.5px] text-[#6B7385]">No email provided</div>
                )}
              </div>
              <span className={`text-[11px] px-2.5 py-1 rounded-full border ${selectedStatusClass}`}>{selected?.status || "new"}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6 text-[13.5px]">
              <Info l="Company" v={selected?.company}/>
              <Info l="Phone" v={selected?.phone}/>
              <Info l="Service" v={selected?.service}/>
              <Info l="Budget" v={selected?.budget}/>
              <Info l="Timeline" v={selected?.timeline}/>
              <Info l="Created" v={formatDate(selected?.created_at, "datetime")}/>
            </div>
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-[#6B7385] mb-2">Description</div>
              <p className="text-[14px] text-[#C9D2E0] whitespace-pre-wrap leading-relaxed">{selected?.description || "-"}</p>
            </div>
            {selected?.file_name && (
              <div className="mt-4 text-[13px] text-[#9AA3B8]">Attached: {selected.file_name}</div>
            )}
            <div className="mt-7 flex flex-wrap gap-2">
              {STATUSES.filter((s) => s !== "all").map((s) => (
                <button key={s} onClick={() => updateStatus(selected?.id, s)} data-testid={`set-status-${s}`} className={`px-3 py-1.5 rounded-full text-[12px] border ${selected?.status === s ? STATUS_COLOR[s] : "border-white/10 text-[#9AA3B8] hover:bg-white/5"}`}>
                  {s}
                </button>
              ))}
              <button onClick={() => remove(selected?.id)} data-testid="delete-lead" className="ml-auto px-3 py-1.5 rounded-full text-[12px] border border-red-500/30 text-red-300 hover:bg-red-500/10"><Trash2 size={12} className="inline mr-1"/>Delete</button>
            </div>
          </motion.div>
        </motion.div>
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
