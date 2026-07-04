import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, Clock, Instagram, Linkedin, Loader2, Mail, Paperclip, Phone } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { CONTACT } from "@/data/site";
import { apiClient } from "@/config/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const serviceOptions = [
  "Software Development",
  "Cognitive Automation & AI",
  "Data Intelligence",
  "Strategic Growth",
  "IoT & Industrial Automation",
  "Continuity & Security",
  "Other / Not sure yet",
];
const budgetOptions = [
  "Under ₹50,000",
  "₹50,000 – ₹1,50,000",
  "₹1,50,000 – ₹5,00,000",
  "₹5,00,000+",
  "Not sure yet / Need guidance",
];
const timelineOptions = ["Not sure yet", "As soon as possible", "Within 1 month", "1-3 months", "3+ months"];
const phoneError = "Please enter a valid phone number, including the country code if outside India (e.g. +1 415 555 2671).";

function isValidPhone(input, defaultCountry = "IN") {
  const phoneNumber = parsePhoneNumberFromString(input, defaultCountry);
  return phoneNumber ? phoneNumber.isValid() : false;
}

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

function ContactSelect({ id, testId, value, onChange, placeholder, options, invalid, describedBy }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        data-testid={testId}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="contact-field h-12 justify-between rounded-xl bg-white/5 px-4 py-3 text-left text-[16px] font-normal text-[#F7FAFF] shadow-none ring-0 focus:ring-2 focus:ring-[#1E6BFF]/20 sm:text-[14.5px] [&>span]:truncate"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={6}
        className="z-[90] max-h-72 rounded-xl border border-white/10 bg-[#070B14] p-1 text-[#E7EBF3] shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="cursor-pointer rounded-lg px-3 py-2.5 pr-8 text-[13.5px] text-[#DCE6F7] outline-none transition focus:bg-[#1E6BFF]/20 focus:text-white data-[state=checked]:bg-[#1E6BFF]/15 data-[state=checked]:text-white"
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    timeline: "",
    description: "",
    file: null,
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
    if (form.phone && !isValidPhone(form.phone, "IN")) next.phone = phoneError;
    if (!form.service) next.service = "Select the service you are interested in.";
    if (!form.description.trim()) next.description = "Message is required.";
    if (form.file && form.file.size > 8 * 1024 * 1024) next.file = "Attachment must be 8MB or smaller.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy || !validate()) return;

    setBusy(true);
    setErr("");
    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.service ? `${form.service} enquiry` : "Contact form enquiry",
        service: form.service || null,
        budget: form.budget || null,
        description: form.description.trim(),
        timeline: form.timeline || null,
      };

      if (form.file) {
        const data = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value) data.append(key, value);
        });
        data.append("file", form.file);
        await apiClient.post("/leads/with-file", data, {
          timeout: 30000,
        });
      } else {
        await apiClient.post("/leads", payload, { timeout: 15000 });
      }
      setDone(true);
      setForm({ name: "", company: "", email: "", phone: "", service: "", budget: "", timeline: "", description: "", file: null });
    } catch (error) {
      setErr(formatBackendError(error.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const input = "contact-field w-full";
  const label = "block text-[12px] font-medium text-[#C9D2E0] mb-1.5";
  const errorText = "mt-1.5 text-[12px] text-red-300";
  const contactCards = [
    {
      icon: Mail,
      title: "Email",
      body: "General support and business inquiries",
      links: [
        { label: "General Support", value: CONTACT.support, href: "mailto:support@dortxtech.com" },
        { label: "Business Inquiries", value: CONTACT.founder, href: "mailto:thrisha@dortxtech.com" },
      ],
    },
    {
      icon: Phone,
      title: "Phone",
      body: "Business phone number",
      links: [{ label: "Business phone number", value: CONTACT.phone, href: CONTACT.phoneHref }],
    },
    {
      icon: Clock,
      title: "Business Hours",
      body: "Monday - Friday",
      text: "9:00 AM - 6:00 PM IST",
    },
    {
      icon: Instagram,
      title: "Social Links",
      body: "Follow DortX updates",
      links: [
        { label: "LinkedIn", href: CONTACT.linkedin, icon: Linkedin },
        { label: "Instagram", href: CONTACT.instagram, icon: Instagram },
      ],
    },
  ];

  return (
    <div data-testid="contact-page">
      <section className="pt-28 sm:pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Contact</div>
          <h1 className="font-display page-heading text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] tracking-normal font-semibold mt-4 max-w-4xl">
            Tell us about <span className="gradient-text">your problem</span>.
          </h1>
          <p className="mt-5 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            Share the essentials and DortX will respond with a practical next step. No automated drip emails, just a real person reading what you wrote.
          </p>
        </div>
      </section>

      <section className="pb-10 sm:pb-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {done ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 sm:p-8 text-center" role="status">
                <CheckCircle2 className="mx-auto text-[#22c55e] mb-4" size={44} />
                <h3 className="font-display text-[24px] font-semibold">Message received</h3>
                <p className="mt-3 text-[15px] text-[#9AA3B8]">Thanks. We have logged your enquiry and will get back to you within one working day.</p>
              </motion.div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form" className="glass rounded-2xl p-4 min-[390px]:p-5 sm:p-5 lg:p-6 space-y-4" noValidate>
                <div>
                  <div className="inline-flex items-center gap-2 text-[11.5px] tracking-[0.16em] uppercase text-[#4D8BFF]">
                    <Building2 size={14} /> Project enquiry
                  </div>
                  <h2 className="font-display text-[24px] sm:text-[30px] leading-tight font-semibold mt-3">Start with the details that matter.</h2>
                  <p className="mt-3 text-[14.5px] sm:text-[15px] text-[#9AA3B8] leading-relaxed max-w-2xl">
                    Tell us what you want to build, automate or improve. The more context you share, the faster we can suggest the right path.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
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
                    <PhoneInput
                      id="contact-phone"
                      data-testid="contact-phone"
                      international
                      defaultCountry="IN"
                      countryCallingCodeEditable={false}
                      placeholder="+91 98765 43210"
                      className="contact-phone-input"
                      value={form.phone}
                      onChange={(value) => setField("phone", value || "")}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                    />
                    {errors.phone && <p id="contact-phone-error" className={errorText}>{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-service" className={label}>Service Interested In *</label>
                    <ContactSelect
                      id="contact-service"
                      testId="contact-service"
                      value={form.service}
                      onChange={(value) => setField("service", value)}
                      placeholder="Select a service"
                      options={serviceOptions}
                      invalid={Boolean(errors.service)}
                      describedBy={errors.service ? "contact-service-error" : undefined}
                    />
                    {errors.service && <p id="contact-service-error" className={errorText}>{errors.service}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-budget" className={label}>Budget</label>
                    <ContactSelect
                      id="contact-budget"
                      testId="contact-budget"
                      value={form.budget}
                      onChange={(value) => setField("budget", value)}
                      placeholder="Select budget range"
                      options={budgetOptions}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-timeline" className={label}>Timeline</label>
                    <ContactSelect
                      id="contact-timeline"
                      testId="contact-timeline"
                      value={form.timeline}
                      onChange={(value) => setField("timeline", value)}
                      placeholder="Select timeline"
                      options={timelineOptions}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-description" className={label}>Message / Requirements *</label>
                  <textarea id="contact-description" data-testid="contact-description" required rows={6} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "contact-description-error" : undefined} placeholder="Tell us about your project, users, goals, integrations, deadlines or current pain points." className={`${input} resize-y min-h-[160px]`} value={form.description} onChange={(event) => setField("description", event.target.value)} />
                  {errors.description && <p id="contact-description-error" className={errorText}>{errors.description}</p>}
                </div>

                <div>
                  <label htmlFor="contact-file" className={label}>Attachment <span className="text-[#6B7385]">(Optional)</span></label>
                  <label className="contact-field min-h-[58px] flex items-center justify-between gap-3 cursor-pointer">
                    <span className="flex items-center gap-2 min-w-0">
                      <Paperclip size={16} className="text-[#4D8BFF] shrink-0" />
                      <span className="truncate text-[#C9D2E0]">{form.file?.name || "Upload brief, reference, resume or document"}</span>
                    </span>
                    <span className="text-[12px] text-[#6B7385] shrink-0">Max 8MB</span>
                    <input
                      id="contact-file"
                      data-testid="contact-file"
                      type="file"
                      className="sr-only"
                      onChange={(event) => setField("file", event.target.files?.[0] || null)}
                    />
                  </label>
                  {errors.file && <p className={errorText}>{errors.file}</p>}
                </div>

                {err && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-200 text-[13px]">{err}</div>}

                <button data-testid="contact-submit" disabled={busy} aria-busy={busy} className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {busy ? <><Loader2 size={16} className="animate-spin" /> Sending</> : "Send message"}
                </button>
              </form>
            )}
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Contact Us</div>
              <h2 className="font-display text-[24px] sm:text-[30px] leading-tight font-semibold mt-2">Reach the right person quickly.</h2>
            </div>
            <p className="text-[14.5px] text-[#9AA3B8] max-w-md leading-relaxed">
              Prefer email or a direct call? These links work across desktop and supported mobile devices.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:border-[#1E6BFF]/40">
                  <div className="w-10 h-10 rounded-xl bg-[#1E6BFF]/15 border border-[#1E6BFF]/25 flex items-center justify-center text-[#4D8BFF]">
                    <Icon size={18} />
                  </div>
                  <div className="mt-5 font-display text-white text-[15.5px] font-semibold">{card.title}</div>
                  <p className="mt-2 text-[13px] text-[#9AA3B8]">{card.body}</p>
                  {card.text && <div className="mt-2 text-[14px] text-[#DCE6F7] break-words">{card.text}</div>}
                  {card.title === "Social Links" ? (
                    <div className="mt-3 flex items-center gap-2">
                      {card.links?.map((link) => {
                        const BrandIcon = link.icon;
                        return (
                          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} title={link.label} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E6BFF]/25 bg-[#1E6BFF]/15 text-[#4D8BFF] transition hover:border-[#1E6BFF]/45 hover:bg-[#1E6BFF]/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]">
                            <BrandIcon size={26} aria-hidden="true" />
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    card.links?.map((link) => (
                      <div key={link.href} className="mt-3">
                        <p className="text-[12.5px] text-[#9AA3B8]">{link.label}</p>
                        <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined} className="mt-1 inline-block text-[14px] text-[#DCE6F7] hover:text-white hover:underline underline-offset-4 break-all rounded transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]">
                          {link.value}
                        </a>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
