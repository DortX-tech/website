import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Upload, Crown, X, Save, Image as ImageIcon } from "lucide-react";

const BACKEND_BASE = process.env.REACT_APP_BACKEND_URL || "https://api.dortxtech.com";
const API = `${BACKEND_BASE}/api`;

function api() {
  const token = localStorage.getItem("dortx-admin-token");
  return axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });
}

function fullPhoto(p) {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  if (p.startsWith("/api/")) return `${BACKEND_BASE}${p}`;
  return p;
}

const blank = {
  name: "", role: "", bio: "", expertise: "",
  responsibilities: [], photo: null, leadership: false,
  linkedin: "", email_address: "", order: 100,
};

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function readTeamResponse(response) {
  const data = response?.data;
  if (!data || !Array.isArray(data.items)) {
    throw new Error("Team response must include an items array");
  }
  return data.items;
}

function safeInitials(name = "") {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((s) => s?.[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamManager() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api().get("/admin/team");
      setItems(readTeamResponse({ data }));
    } catch (e) {
      setItems([]);
      setError("Team data could not be loaded. Showing empty results.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const open = (m = blank) => setEditing({ ...blank, ...(m ?? {}), responsibilities: toArray(m?.responsibilities) });
  const close = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      if (editing.id) {
        await api().patch(`/admin/team/${editing.id}`, editing);
      } else {
        await api().post(`/admin/team`, editing);
      }
      await load();
      close();
    } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this team member?")) return;
    await api().delete(`/admin/team/${id}`);
    await load();
  };

  const uploadPhoto = async (file) => {
    const fd = new FormData(); fd.append("file", file);
    setBusy(true);
    try {
      const { data } = await api().post("/admin/team/upload-photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setEditing((s) => ({ ...(s ?? blank), photo: data?.url ?? null }));
    } finally { setBusy(false); }
  };

  const setField = (k, v) => setEditing((s) => ({ ...(s ?? blank), [k]: v }));
  const setResp = (idx, v) => setEditing((s) => ({ ...(s ?? blank), responsibilities: toArray(s?.responsibilities).map((r, i) => i === idx ? v : r) }));
  const addResp = () => setEditing((s) => ({ ...(s ?? blank), responsibilities: [...toArray(s?.responsibilities), ""] }));
  const removeResp = (i) => setEditing((s) => ({ ...(s ?? blank), responsibilities: toArray(s?.responsibilities).filter((_, k) => k !== i) }));

  const input = "w-full bg-white/4 border border-white/10 rounded-xl px-3.5 py-2.5 text-[13.5px] focus:outline-none focus:border-[#1E6BFF]/60";
  const safeItems = toArray(items);

  return (
    <div className="mt-6" data-testid="team-panel">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[13px] text-[#9AA3B8]">{safeItems.length} member{safeItems.length === 1 ? "" : "s"}</div>
        <button data-testid="add-team-member" onClick={() => open()} className="btn-primary !py-2 !px-4 !text-[12.5px]"><Plus size={13}/> Add member</button>
      </div>
      {error && (
        <div className="mb-4 glass rounded-xl px-4 py-3 text-[13px] text-amber-200 border border-amber-500/20">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="glass rounded-2xl p-5 text-[13px] text-[#6B7385] sm:col-span-2 lg:col-span-3 text-center">
            Loading team members...
          </div>
        )}
        {!loading && safeItems.length === 0 && (
          <div className="glass rounded-2xl p-5 text-[13px] text-[#6B7385] sm:col-span-2 lg:col-span-3 text-center">
            No team members yet.
          </div>
        )}
        {!loading && safeItems.map((m, index) => (
          <div key={m?.id ?? index} className="glass rounded-2xl p-5 relative group" data-testid={`team-row-${m?.id ?? index}`}>
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0F1830] to-[#0A0F1C] flex items-center justify-center shrink-0">
                {m?.photo ? (
                  <img src={fullPhoto(m.photo)} alt={m?.name || "Team member"} className="w-full h-full object-cover"/>
                ) : (
                  <div className="font-display font-semibold gradient-text text-[20px]">{safeInitials(m?.name)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="font-display text-white text-[15px] font-semibold truncate">{m?.name || "Unnamed member"}</div>
                  {m?.leadership && <Crown size={11} className="text-amber-400 shrink-0"/>}
                </div>
                <div className="text-[12px] text-[#4D8BFF] mt-0.5 truncate">{m?.role || "-"}</div>
                <div className="text-[11.5px] text-[#6B7385] mt-1">Order: {m?.order ?? 100} · Resp: {toArray(m?.responsibilities).length}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button data-testid={`edit-${m?.id ?? index}`} onClick={() => open(m)} className="flex-1 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 text-[12px]">Edit</button>
              <button data-testid={`delete-${m?.id ?? index}`} onClick={() => remove(m?.id)} className="px-3 py-1.5 rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10 text-[12px]"><Trash2 size={11}/></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-end sm:items-center justify-center p-4" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="glass-strong rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" data-testid="team-edit-modal">
            <div className="flex items-center justify-between mb-5">
              <div className="font-display text-[20px] font-semibold">{editing.id ? "Edit member" : "Add member"}</div>
              <button onClick={close} className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center"><X size={16}/></button>
            </div>

            {/* Photo */}
            <div className="flex gap-4 mb-5">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0F1830] to-[#0A0F1C] flex items-center justify-center shrink-0">
                {editing.photo ? (
                  <img src={fullPhoto(editing.photo)} alt="preview" className="w-full h-full object-cover"/>
                ) : (
                  <ImageIcon size={20} className="text-[#4D8BFF]"/>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-white/15 bg-white/[0.02] cursor-pointer hover:border-[#1E6BFF]/40 transition text-[12.5px]">
                  <Upload size={13} className="text-[#4D8BFF]"/> {editing.photo ? "Replace photo" : "Upload photo"}
                  <input data-testid="team-photo-input" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}/>
                </label>
                <input className={`${input} mt-2`} placeholder="…or paste a photo URL" value={editing.photo || ""} onChange={(e) => setField("photo", e.target.value || null)}/>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input data-testid="edit-name" className={input} placeholder="Name" value={editing.name} onChange={(e) => setField("name", e.target.value)}/>
              <input data-testid="edit-role" className={input} placeholder="Role" value={editing.role} onChange={(e) => setField("role", e.target.value)}/>
              <input className={input} placeholder="Expertise" value={editing.expertise || ""} onChange={(e) => setField("expertise", e.target.value)}/>
              <input type="number" className={input} placeholder="Order (lower = first)" value={editing.order ?? 100} onChange={(e) => setField("order", Number(e.target.value))}/>
              <input className={input} placeholder="LinkedIn URL" value={editing.linkedin || ""} onChange={(e) => setField("linkedin", e.target.value)}/>
              <input className={input} placeholder="Email" value={editing.email_address || ""} onChange={(e) => setField("email_address", e.target.value)}/>
            </div>

            <textarea data-testid="edit-bio" className={`${input} mt-3 resize-none`} rows={4} placeholder="Short bio" value={editing.bio || ""} onChange={(e) => setField("bio", e.target.value)}/>

            <label className="flex items-center gap-2 mt-3 text-[13px] cursor-pointer">
              <input type="checkbox" checked={editing.leadership} onChange={(e) => setField("leadership", e.target.checked)}/>
              <Crown size={13} className="text-amber-400"/> Show in <strong>Leadership</strong> section
            </label>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[12px] uppercase tracking-[0.14em] text-[#6B7385]">Responsibilities</div>
                <button onClick={addResp} className="text-[12px] text-[#4D8BFF] hover:text-white"><Plus size={12} className="inline"/> Add</button>
              </div>
              <div className="space-y-2">
                {toArray(editing?.responsibilities).map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input className={input} value={r} onChange={(e) => setResp(i, e.target.value)}/>
                    <button onClick={() => removeResp(i)} className="px-3 rounded-full border border-white/10 hover:bg-white/5"><Trash2 size={12}/></button>
                  </div>
                ))}
                {toArray(editing?.responsibilities).length === 0 && <div className="text-[12px] text-[#6B7385]">No responsibilities yet.</div>}
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={close} className="btn-ghost !py-2.5">Cancel</button>
              <button data-testid="save-team-member" onClick={save} disabled={busy || !editing.name || !editing.role} className="btn-primary !py-2.5 disabled:opacity-50"><Save size={14}/> {busy ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
