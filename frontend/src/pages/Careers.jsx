import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Coffee, Rocket, Globe, CheckCircle2 } from "lucide-react";
import axios from "axios";
import SectionHeader from "@/components/SectionHeader";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api`;

const CULTURE = [
  { i: Heart, t: "Care for the craft", d: "Code reviews, design critiques, written docs — done with kindness and high standards." },
  { i: Coffee, t: "Calm async culture", d: "Deep work over meetings. Most days, no calls before noon." },
  { i: Rocket, t: "Ship and learn", d: "We celebrate small, frequent releases more than big slow launches." },
  { i: Globe, t: "Remote-first", d: "Work from anywhere — outcomes matter, locations don't." },
];

export default function Careers() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", experience: "", portfolio: "", cover_letter: "" });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await axios.post(`${API}/careers/apply`, form);
      setDone(true);
    } catch (e) {
      setErr(e.response?.data?.detail || "Could not submit your application. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#1E6BFF]/60 transition";

  return (
    <div data-testid="careers-page">
      <section className="pt-32 pb-10 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Careers</div>
          <h1 className="font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1.02] font-semibold mt-4 max-w-4xl">
            Build the future of <span className="gradient-text">business technology</span>.
          </h1>
          <p className="mt-6 text-[17px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            We grow slowly and intentionally. If you're an engineer, designer, AI specialist or growth operator who wants to actually own the work — and learn fast alongside people who care about quality — talk to us.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader eyebrow="Culture" title="Why people stay." />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CULTURE.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card-glow p-6">
                <c.i className="text-[#4D8BFF] mb-4" size={22}/>
                <div className="font-display text-white font-semibold text-[16px]">{c.t}</div>
                <p className="mt-2 text-[13.5px] text-[#9AA3B8] leading-relaxed">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <SectionHeader eyebrow="Open positions" title="No active roles — but we're always listening." subtitle="Send us your story. If there's a fit, we'll find a way to talk." />
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          {done ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 sm:p-10 text-center">
              <CheckCircle2 className="mx-auto text-[#22c55e] mb-4" size={40}/>
              <h3 className="font-display text-[26px] font-semibold">Application received</h3>
              <p className="mt-3 text-[15px] text-[#9AA3B8]">Thanks for reaching out. We read every application and reply within a week.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} data-testid="careers-form" className="glass rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input data-testid="career-name" required placeholder="Full name *" className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
                <input data-testid="career-email" required type="email" placeholder="Email *" className={input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
                <input data-testid="career-phone" placeholder="Phone (optional)" className={input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/>
                <input data-testid="career-position" required placeholder="Position you're applying for *" className={input} value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}/>
                <input data-testid="career-experience" placeholder="Years of experience" className={input} value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}/>
                <input data-testid="career-portfolio" placeholder="Portfolio / LinkedIn URL" className={input} value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })}/>
              </div>
              <textarea data-testid="career-cover" required placeholder="Why DortX? Tell us a bit about you. *" rows={6} className={input + " resize-none"} value={form.cover_letter} onChange={e => setForm({ ...form, cover_letter: e.target.value })}/>
              {err && <div className="text-red-400 text-[13px]">{err}</div>}
              <button data-testid="career-submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">{busy ? "Submitting…" : "Submit application"}</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
