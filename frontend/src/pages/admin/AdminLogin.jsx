import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { LogIn, Lock, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

const API = `${process.env.REACT_APP_BACKEND_URL || "https://api.dortxtech.com"}/api`;

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg ?? item?.message ?? JSON.stringify(item))
      .filter(Boolean)
      .join(" ");
  }
  if (detail && typeof detail === "object") return detail?.msg ?? detail?.message ?? "Login failed";
  return "Login failed";
}

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (localStorage.getItem("dortx-admin-token")) return <Navigate to="/admin" replace/>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("dortx-admin-token", data.access_token);
      localStorage.setItem("dortx-admin-email", data.email);
      localStorage.setItem("dortx-admin-name", data.name || "DortX Admin");
      if (data.avatar) {
        localStorage.setItem("dortx-admin-avatar", data.avatar);
      } else {
        localStorage.removeItem("dortx-admin-avatar");
      }
      nav("/admin", { replace: true });
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080F] relative flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-grid opacity-40"/>
      <div className="absolute inset-0 bg-radial-glow"/>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md glass-strong rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <Logo height={52}/>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#4D8BFF]">Admin</div>
        </div>
        <h1 className="font-display text-[28px] font-semibold">Welcome back</h1>
        <p className="mt-2 text-[14px] text-[#9AA3B8]">Sign in to manage leads and applications.</p>

        <form onSubmit={submit} className="mt-7 space-y-3" data-testid="admin-login-form">
          <input data-testid="admin-email" required type="email" placeholder="Email" className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#1E6BFF]/60" value={email} onChange={e => setEmail(e.target.value)}/>
          <input data-testid="admin-password" required type="password" placeholder="Password" className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#1E6BFF]/60" value={password} onChange={e => setPassword(e.target.value)}/>
          {err && <div className="flex items-center gap-2 text-red-400 text-[13px]"><AlertCircle size={14}/>{err}</div>}
          <button data-testid="admin-login-submit" type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
            {busy ? "Signing in…" : (<><LogIn size={15}/> Sign in</>)}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-2 text-[12px] text-[#6B7385]">
          <Lock size={12}/> Internal access only · DortX administrators
        </div>
      </motion.div>
    </div>
  );
}
