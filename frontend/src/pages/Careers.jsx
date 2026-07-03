import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Coffee, Rocket, Globe, CheckCircle2, Briefcase } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { apiClient } from "@/config/api";

const CULTURE = [
  { i: Heart, t: "Care for the craft", d: "Code reviews, design critiques, and written docs are handled with kindness and high standards." },
  { i: Coffee, t: "Calm async culture", d: "Deep work matters. We keep communication clear, focused, and respectful of maker time." },
  { i: Rocket, t: "Ship and learn", d: "We value practical progress, high-quality delivery, and thoughtful iteration." },
  { i: Globe, t: "Remote-first", d: "Work from anywhere. Outcomes, ownership, and communication matter more than location." },
];

export default function Careers() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", experience: "", portfolio: "", cover_letter: "" });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await apiClient.post("/careers/apply", form);
      setDone(true);
    } catch (e) {
      setErr(e.response?.data?.detail || "Could not submit your application. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "contact-field w-full";
  const label = "block text-[12px] font-medium text-[#C9D2E0] mb-1.5";

  return (
    <div data-testid="careers-page">
      <section className="pt-28 sm:pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Careers</div>
          <h1 className="font-display text-[36px] sm:text-[50px] lg:text-[60px] leading-[1.05] font-semibold mt-4 max-w-4xl">
            Join Our <span className="gradient-text">Team</span>
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            Join a focused technology team building practical AI, software, automation, and digital systems with quality at the center.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader eyebrow="Culture" title="Why people stay." />
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CULTURE.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card-glow p-5">
                <c.i className="text-[#4D8BFF] mb-4" size={22}/>
                <div className="font-display text-white font-semibold text-[15px]">{c.t}</div>
                <p className="mt-2 text-[13.5px] text-[#9AA3B8] leading-relaxed">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="glass rounded-2xl p-5 sm:p-5 mb-5 border border-white/8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E6BFF]/15 border border-[#1E6BFF]/25 flex items-center justify-center shrink-0">
                <Briefcase size={18} className="text-[#4D8BFF]"/>
              </div>
              <div>
                <h2 className="font-display text-white text-[18px] sm:text-[22px] font-semibold">
                  We are not currently hiring for specific roles.
                </h2>
                <p className="mt-3 text-[14.5px] sm:text-[15px] text-[#9AA3B8] leading-relaxed">
                  However, we are always excited to connect with talented people. If you believe you&apos;d be a great fit for DortX, submit your application and we&apos;ll keep your profile for future opportunities.
                </p>
              </div>
            </div>
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 sm:p-8 text-center">
              <CheckCircle2 className="mx-auto text-[#22c55e] mb-4" size={40}/>
              <h3 className="font-display text-[22px] font-semibold">Application received</h3>
              <p className="mt-3 text-[15px] text-[#9AA3B8]">Thanks for reaching out. We read every application and will contact you if there is a strong fit.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} data-testid="careers-form" className="glass rounded-2xl p-5 sm:p-5 space-y-3.5 border border-white/8">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="career-name" className={label}>Full Name *</label>
                  <input id="career-name" data-testid="career-name" required autoComplete="name" placeholder="Your full name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
                </div>
                <div>
                  <label htmlFor="career-email" className={label}>Email *</label>
                  <input id="career-email" data-testid="career-email" required type="email" autoComplete="email" placeholder="you@example.com" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
                </div>
                <div>
                  <label htmlFor="career-phone" className={label}>Phone <span className="text-[#6B7385]">(Optional)</span></label>
                  <input id="career-phone" data-testid="career-phone" type="tel" autoComplete="tel" placeholder="+91 00000 00000" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
                </div>
                <div>
                  <label htmlFor="career-position" className={label}>Area of Interest *</label>
                  <input id="career-position" data-testid="career-position" required placeholder="Engineering, AI, design, growth..." className={input} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}/>
                </div>
                <div>
                  <label htmlFor="career-experience" className={label}>Years of Experience</label>
                  <input id="career-experience" data-testid="career-experience" placeholder="Example: 2 years" className={input} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}/>
                </div>
                <div>
                  <label htmlFor="career-portfolio" className={label}>Portfolio / LinkedIn URL</label>
                  <input id="career-portfolio" data-testid="career-portfolio" type="url" placeholder="https://..." className={input} value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })}/>
                </div>
              </div>
              <div>
                <label htmlFor="career-cover" className={label}>Message *</label>
                <textarea id="career-cover" data-testid="career-cover" required placeholder="Tell us about your background, strengths, and why DortX feels like a good fit." rows={5} className={`${input} resize-none min-h-[140px]`} value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}/>
              </div>
              {err && <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-200 text-[13px]">{err}</div>}
              <button data-testid="career-submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">{busy ? "Submitting..." : "Submit application"}</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
