import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, MessageSquare, Phone } from "lucide-react";
import axios from "axios";
import { CONTACT } from "@/data/site";

const API = `${process.env.REACT_APP_BACKEND_URL || "https://api.dortxtech.com"}/api`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatBackendError = (detail) => {
  if (!detail) return "Could not send your message. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        const location = Array.isArray(item?.loc) ? item.loc.filter((part) => part !== "body").join(".") : "";
        const message = item?.msg || item?.message || JSON.stringify(item);
        return location ? `${location}: ${message}` : message;
      })
      .join(" ");
  }
  if (typeof detail === "object") {
    return detail.message || detail.msg || JSON.stringify(detail);
  }
  return String(detail);
};

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!emailPattern.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!form.description.trim()) next.description = "Message is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy || !validate()) return;

    setBusy(true);
    setErr("");
    try {
      await axios.post(`${API}/leads`, {
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject.trim() || null,
        service: null,
        budget: null,
        description: form.description.trim(),
        timeline: null,
      }, { timeout: 15000 });
      setDone(true);
    } catch (error) {
      setErr(formatBackendError(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const input = "contact-field w-full";
  const label = "block text-[12px] font-medium text-[#C9D2E0] mb-1.5";
  const errorText = "mt-1.5 text-[12px] text-red-300";

  return (
    <div data-testid="contact-page">
      <section className="pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Contact</div>
          <h1 className="font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1.02] font-semibold mt-4 max-w-4xl">
            Tell us about <span className="gradient-text">your problem</span>.
          </h1>
          <p className="mt-5 text-[17px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            We will reply within one business day. No automated drip emails, just a real person reading what you wrote.
          </p>
        </div>
      </section>

      <section className="pb-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-5 space-y-3.5">
            <div className="glass rounded-2xl p-5">
              <Mail className="text-[#4D8BFF] mb-3" size={22} />
              <div className="font-display text-white font-semibold">Write to us</div>
              <a href={`mailto:${CONTACT.support}`} className="block mt-1 text-[#C9D2E0] text-[14.5px] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]">
                {CONTACT.support}
              </a>
              <a href={`mailto:${CONTACT.founder}`} className="block mt-0.5 text-[#9AA3B8] text-[13px] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]">
                Founder | {CONTACT.founder}
              </a>
            </div>

            <div className="glass rounded-2xl p-5">
              <MessageSquare className="text-[#4D8BFF] mb-3" size={22} />
              <div className="font-display text-white font-semibold">Chat with DortX AI</div>
              <p className="mt-1 text-[13.5px] text-[#9AA3B8]">
                Use the floating chat button to ask anything about DortX, services, process, tech, and timelines.
              </p>
            </div>

            <div className="glass rounded-2xl p-5">
              <Phone className="text-[#4D8BFF] mb-3" size={22} />
              <div className="font-display text-white font-semibold">Call us</div>
              <a href={CONTACT.phoneHref} className="block mt-1 text-[#C9D2E0] text-[14.5px] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]">
                {CONTACT.phone}
              </a>
              <p className="mt-1 text-[13.5px] text-[#9AA3B8]">For project enquiries and business conversations.</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {done ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 sm:p-10 text-center" role="status">
                <CheckCircle2 className="mx-auto text-[#22c55e] mb-4" size={44} />
                <h3 className="font-display text-[28px] font-semibold">Message received</h3>
                <p className="mt-3 text-[15px] text-[#9AA3B8]">Thanks. We have logged your enquiry and will get back to you within one working day.</p>
              </motion.div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form" className="glass rounded-2xl p-5 sm:p-6 space-y-3.5" noValidate>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="contact-name" className={label}>Full Name *</label>
                    <input id="contact-name" data-testid="contact-name" required autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} placeholder="Your full name" className={input} value={form.name} onChange={(event) => setField("name", event.target.value)} />
                    {errors.name && <p id="contact-name-error" className={errorText}>{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-company" className={label}>Company <span className="text-[#6B7385]">(Optional)</span></label>
                    <input id="contact-company" data-testid="contact-company" autoComplete="organization" placeholder="Company name" className={input} value={form.company} onChange={(event) => setField("company", event.target.value)} />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className={label}>Email *</label>
                    <input id="contact-email" data-testid="contact-email" required type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} placeholder="you@example.com" className={input} value={form.email} onChange={(event) => setField("email", event.target.value)} />
                    {errors.email && <p id="contact-email-error" className={errorText}>{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className={label}>Phone <span className="text-[#6B7385]">(Optional)</span></label>
                    <input id="contact-phone" data-testid="contact-phone" type="tel" autoComplete="tel" placeholder="+91 00000 00000" className={input} value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className={label}>Subject <span className="text-[#6B7385]">(Optional)</span></label>
                  <input id="contact-subject" data-testid="contact-subject" placeholder="AI, software, IoT, automation..." className={input} value={form.subject} onChange={(event) => setField("subject", event.target.value)} />
                </div>

                <div>
                  <label htmlFor="contact-description" className={label}>Message *</label>
                  <textarea id="contact-description" data-testid="contact-description" required rows={5} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "contact-description-error" : undefined} placeholder="Tell us about your project or business problem." className={`${input} resize-none min-h-[140px]`} value={form.description} onChange={(event) => setField("description", event.target.value)} />
                  {errors.description && <p id="contact-description-error" className={errorText}>{errors.description}</p>}
                </div>

                {err && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-200 text-[13px]">{err}</div>}

                <button data-testid="contact-submit" disabled={busy} aria-busy={busy} className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {busy ? <><Loader2 size={16} className="animate-spin" /> Sending</> : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
