import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, MessageSquare, Clock, Upload } from "lucide-react";
import axios from "axios";
import SectionHeader from "@/components/SectionHeader";
import { WINGS, CONTACT } from "@/data/site";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BUDGETS = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k – $150k", "$150k+"];
const TIMELINES = ["ASAP", "< 1 month", "1–3 months", "3–6 months", "Flexible"];

export default function Contact() {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "",
    service: WINGS[0].name, budget: BUDGETS[1], description: "", timeline: TIMELINES[2],
  });
  const [file, setFile] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      if (file) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("file", file);
        await axios.post(`${API}/leads/with-file`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await axios.post(`${API}/leads`, form);
      }
      setDone(true);
    } catch (e) {
      setErr(e.response?.data?.detail?.toString() || "Could not send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-[14.5px] focus:outline-none focus:border-[#1E6BFF]/60 transition";

  return (
    <div data-testid="contact-page">
      <section className="pt-36 pb-12 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Contact</div>
          <h1 className="font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1.02] font-semibold mt-4 max-w-4xl">
            Tell us about <span className="gradient-text">your problem</span>.
          </h1>
          <p className="mt-6 text-[17px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            We'll reply within one business day. No automated drip emails — just a real person reading what you wrote.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-5">
            <div className="glass rounded-2xl p-6">
              <Mail className="text-[#4D8BFF] mb-3" size={22}/>
              <div className="font-display text-white font-semibold">Write to us</div>
              <a href={`mailto:${CONTACT.support}`} className="block mt-1 text-[#C9D2E0] text-[14.5px]">{CONTACT.support}</a>
              <a href={`mailto:${CONTACT.founder}`} className="block mt-0.5 text-[#9AA3B8] text-[13px]">Founder · {CONTACT.founder}</a>
            </div>
            <div className="glass rounded-2xl p-6">
              <MessageSquare className="text-[#4D8BFF] mb-3" size={22}/>
              <div className="font-display text-white font-semibold">Chat with DortX AI</div>
              <p className="mt-1 text-[13.5px] text-[#9AA3B8]">Use the floating chat button to ask anything about DortX — services, process, tech, timelines.</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <Clock className="text-[#4D8BFF] mb-3" size={22}/>
              <div className="font-display text-white font-semibold">Response time</div>
              <p className="mt-1 text-[13.5px] text-[#9AA3B8]">Under 1 business day, every weekday.</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {done ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-10 text-center">
                <CheckCircle2 className="mx-auto text-[#22c55e] mb-4" size={44}/>
                <h3 className="font-display text-[28px] font-semibold">Message received</h3>
                <p className="mt-3 text-[15px] text-[#9AA3B8]">Thanks — we've logged your enquiry and will get back to you within one working day.</p>
              </motion.div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form" className="glass rounded-2xl p-7 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input data-testid="contact-name" required placeholder="Full name *" className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
                  <input data-testid="contact-company" placeholder="Company" className={input} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}/>
                  <input data-testid="contact-email" required type="email" placeholder="Email *" className={input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
                  <input data-testid="contact-phone" placeholder="Phone" className={input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/>
                  <select data-testid="contact-service" className={input} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                    {WINGS.map(w => <option key={w.id} value={w.name} label={w.name}>{w.name}</option>)}
                  </select>
                  <select data-testid="contact-budget" className={input} value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}>
                    {BUDGETS.map(b => <option key={b} value={b} label={b}>{b}</option>)}
                  </select>
                  <select data-testid="contact-timeline" className={input + " sm:col-span-2"} value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })}>
                    {TIMELINES.map(t => <option key={t} value={t} label={`Timeline · ${t}`}>{`Timeline · ${t}`}</option>)}
                  </select>
                </div>
                <textarea data-testid="contact-description" required rows={6} placeholder="Tell us about your project. The business problem matters more than the technology. *" className={input + " resize-none"} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] cursor-pointer hover:border-[#1E6BFF]/40 transition" data-testid="contact-file-label">
                  <Upload size={16} className="text-[#4D8BFF]"/>
                  <span className="text-[13.5px] text-[#9AA3B8]">{file ? file.name : "Attach a brief or document (optional)"}</span>
                  <input type="file" data-testid="contact-file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/>
                </label>

                {err && <div className="text-red-400 text-[13px]">{err}</div>}
                <button data-testid="contact-submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">{busy ? "Sending…" : "Send message"}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
