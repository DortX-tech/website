import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Loader2, Mail, MessageSquare, Phone } from "lucide-react";
import axios from "axios";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { CONTACT } from "@/data/site";
import { API_URL } from "@/config/api";

const API = API_URL;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROJECT_WINGS = [
  "Software Development",
  "AI Solutions & Automation",
  "Data Intelligence & Analytics",
  "Cloud & Infrastructure",
  "IoT & Industrial Automation",
  "Digital Marketing",
];
const PROJECT_TIMELINES = [
  "ASAP",
  "Within 1 Week",
  "Within 2 Weeks",
  "Within 1 Month",
  "Within 2–3 Months",
  "More than 3 Months",
  "Just Exploring",
];
const BUDGET_OPTIONS = [
  "Under ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹3,00,000",
  "Above ₹3,00,000",
  "Need Consultation",
];

function ThemedSelect({ id, testId, labelClass, labelText, value, placeholder, options, error, errorId, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.indexOf(value)));
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listboxId = `${id}-listbox`;

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (open) setActiveIndex(Math.max(0, options.indexOf(value)));
  }, [open, options, value]);

  const choose = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => {
        const delta = event.key === "ArrowDown" ? 1 : -1;
        return (current + delta + options.length) % options.length;
      });
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(options[activeIndex]);
      else setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className={labelClass}>{labelText}</label>
      <button
        ref={buttonRef}
        id={id}
        data-testid={testId}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`contact-field contact-select-trigger ${value ? "" : "text-[#6B7385]"}`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKeyDown}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-[#9AA3B8] transition ${open ? "rotate-180 text-[#4D8BFF]" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={listboxId} role="listbox" aria-label={labelText.replace("*", "").trim()} className="contact-select-menu">
          {options.map((option, index) => {
            const selected = option === value;
            const active = index === activeIndex;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                className={`contact-select-option ${active ? "is-active" : ""} ${selected ? "is-selected" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
      {error && <p id={errorId} className="mt-1.5 text-[12px] text-red-300">{error}</p>}
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    projectWing: "",
    timeline: "",
    budget: "",
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
    if (!form.phone || !isValidPhoneNumber(form.phone)) next.phone = "Enter a valid international phone number.";
    if (!form.projectWing) next.projectWing = "Project wing is required.";
    if (!form.timeline) next.timeline = "Project timeline is required.";
    if (!form.budget) next.budget = "Estimated budget is required.";
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
        fullName: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim(),
        phone: form.phone || null,
        projectWing: form.projectWing,
        service: form.projectWing,
        timeline: form.timeline,
        budget: form.budget,
        message: form.description.trim(),
        description: form.description.trim(),
      }, { timeout: 15000 });
      setDone(true);
    } catch (error) {
      setErr(error.response?.data?.detail?.toString() || "Could not send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-[14.5px] text-[#F7FAFF] placeholder:text-[#6B7385] caret-[#4D8BFF] focus:outline-none focus:border-[#4D8BFF] focus:ring-2 focus:ring-[#1E6BFF]/20 transition";
  const label = "block text-[12px] font-medium text-[#C9D2E0] mb-1.5";
  const errorText = "mt-1.5 text-[12px] text-red-300";

  return (
    <div data-testid="contact-page">
      <section className="pt-32 pb-10 relative">
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

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
          <div className="lg:col-span-7">
            {done ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-10 text-center" role="status">
                <CheckCircle2 className="mx-auto text-[#22c55e] mb-4" size={44} />
                <h3 className="font-display text-[28px] font-semibold">Message received</h3>
                <p className="mt-3 text-[15px] text-[#9AA3B8]">Thanks. We have logged your enquiry and will get back to you within one working day.</p>
              </motion.div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form" className="glass rounded-2xl p-5 sm:p-6 space-y-4" noValidate>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className={label}>Full Name *</label>
                    <input id="contact-name" data-testid="contact-name" required autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} placeholder="Your full name" className={input} value={form.name} onChange={(event) => setField("name", event.target.value)} />
                    {errors.name && <p id="contact-name-error" className={errorText}>{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-company" className={label}>Company Name <span className="text-[#6B7385]">(Optional)</span></label>
                    <input id="contact-company" data-testid="contact-company" autoComplete="organization" placeholder="Company name" className={input} value={form.company} onChange={(event) => setField("company", event.target.value)} />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className={label}>Email *</label>
                    <input id="contact-email" data-testid="contact-email" required type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} placeholder="you@example.com" className={input} value={form.email} onChange={(event) => setField("email", event.target.value)} />
                    {errors.email && <p id="contact-email-error" className={errorText}>{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className={label}>Phone Number *</label>
                    <PhoneInput
                      id="contact-phone"
                      data-testid="contact-phone"
                      international
                      defaultCountry="IN"
                      countryCallingCodeEditable={false}
                      addInternationalOption={false}
                      autoComplete="tel"
                      placeholder="+91 00000 00000"
                      className="contact-phone-input"
                      value={form.phone}
                      onChange={(value) => setField("phone", value || "")}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                    />
                    {errors.phone && <p id="contact-phone-error" className={errorText}>{errors.phone}</p>}
                  </div>

                  <ThemedSelect id="contact-project-wing" testId="contact-project-wing" labelClass={label} labelText="Project Wing *" value={form.projectWing} placeholder="Select project wing" options={PROJECT_WINGS} error={errors.projectWing} errorId="contact-project-wing-error" onChange={(value) => setField("projectWing", value)} />

                  <ThemedSelect id="contact-timeline" testId="contact-timeline" labelClass={label} labelText="Project Timeline *" value={form.timeline} placeholder="Select timeline" options={PROJECT_TIMELINES} error={errors.timeline} errorId="contact-timeline-error" onChange={(value) => setField("timeline", value)} />

                  <ThemedSelect id="contact-budget" testId="contact-budget" labelClass={label} labelText="Estimated Budget *" value={form.budget} placeholder="Select budget" options={BUDGET_OPTIONS} error={errors.budget} errorId="contact-budget-error" onChange={(value) => setField("budget", value)} />
                </div>

                <div>
                  <label htmlFor="contact-description" className={label}>Project Description *</label>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
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
              {CONTACT.phones.map((phone) => (
  <div key={phone.number}>
    <a
      href={phone.href}
      className="..."
    >
      {phone.number}
    </a>
  </div>
  
))}
              <p className="mt-1 text-[13.5px] text-[#9AA3B8]">For project enquiries and business conversations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
