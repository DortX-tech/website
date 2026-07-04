import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, ArrowUpRight, CheckCircle2, Instagram, Linkedin, Send } from "lucide-react";
import Logo from "./Logo";
import { CONTACT, SOCIALS } from "@/data/site";
import { apiClient } from "@/config/api";

const SocialIconMap = { Instagram, Linkedin };

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email || busy) return;
    setBusy(true);
    try {
      await apiClient.post("/newsletter/subscribe", { email, source: "footer" });
      setDone(true);
      setEmail("");
    } catch (err) {
      if (err?.response?.status && err.response.status < 500) {
        setDone(true);
      } else {
        alert("Couldn't subscribe right now - please try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer data-testid="main-footer" className="relative mt-6 border-t border-white/8">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#1E6BFF]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo height={84} />
            <p className="mt-4 text-[#9AA3B8] text-[14.5px] leading-relaxed max-w-sm">
              DortX builds reliable AI, software, IoT, and automation solutions with a strong focus on quality, scalability, and timely delivery.
            </p>
            <Link to="/contact" data-testid="footer-cta" className="mt-5 inline-flex btn-primary">
              Start a conversation <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display text-white text-[13px] font-semibold mb-4 tracking-wide">Company</h4>
            <ul className="space-y-2.5 text-[13.5px]">
              <li><Link to="/about" className="text-[#9AA3B8] hover:text-white">About</Link></li>
              <li><Link to="/services" className="text-[#9AA3B8] hover:text-white">Services</Link></li>
              <li><Link to="/technologies" className="text-[#9AA3B8] hover:text-white">Technologies</Link></li>
              <li><Link to="/process" className="text-[#9AA3B8] hover:text-white">Process</Link></li>
              <li><Link to="/team" className="text-[#9AA3B8] hover:text-white">Team</Link></li>
              <li><Link to="/portfolio" className="text-[#9AA3B8] hover:text-white">Portfolio</Link></li>
              <li><Link to="/careers" className="text-[#9AA3B8] hover:text-white">Careers</Link></li>
              <li><Link to="/contact" className="text-[#9AA3B8] hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display text-white text-[13px] font-semibold mb-4 tracking-wide">Service Wings</h4>
            <ul className="space-y-2.5 text-[13.5px]">
              <li><Link to="/services#software" className="text-[#9AA3B8] hover:text-white">Software Development</Link></li>
              <li><Link to="/services#ai" className="text-[#9AA3B8] hover:text-white">Cognitive Automation & AI</Link></li>
              <li><Link to="/services#data" className="text-[#9AA3B8] hover:text-white">Data Intelligence</Link></li>
              <li><Link to="/services#growth" className="text-[#9AA3B8] hover:text-white">Strategic Growth</Link></li>
              <li><Link to="/services#iot" className="text-[#9AA3B8] hover:text-white">IoT &amp; Industrial Automation</Link></li>
              <li><Link to="/services#security" className="text-[#9AA3B8] hover:text-white">Continuity & Security</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="font-display text-white text-[13px] font-semibold mb-4 tracking-wide">Legal</h4>
            <ul className="space-y-2.5 text-[13.5px]">
              <li><Link to="/privacy-policy" className="text-[#9AA3B8] hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-[#9AA3B8] hover:text-white">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-display text-white text-[13px] font-semibold mb-4 tracking-wide">Get in touch</h4>
            <div className="space-y-1.5 text-[13.5px]">
              <a href={`mailto:${CONTACT.support}`} className="text-[#C9D2E0] hover:text-white hover:underline underline-offset-4 flex items-center gap-2 transition">
                <Mail size={13}/> {CONTACT.support}
              </a>
              <a href={`mailto:${CONTACT.founder}`} className="text-[#9AA3B8] hover:text-white hover:underline underline-offset-4 flex items-center gap-2 transition">
                <Mail size={13}/> {CONTACT.founder}
              </a>
              <a href={CONTACT.phoneHref} className="text-[#9AA3B8] hover:text-white flex items-center gap-2">
                <Phone size={13}/> {CONTACT.phone}
              </a>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-[12.5px] text-[#C9D2E0] font-medium">Registered MSME (Government of India)</div>
              <div className="mt-2 text-[12px] text-[#8892A6] leading-relaxed">
                <span className="text-[#9AA3B8]">UDYAM Registration No:</span><br />
                UDYAM-KR-25-0108099
              </div>
            </div>

            <h4 className="font-display text-white text-[13px] font-semibold mt-6 mb-3 tracking-wide">Newsletter</h4>
            {done ? (
              <div className="flex items-center gap-2 text-[#22c55e] text-[13px]" data-testid="newsletter-success">
                <CheckCircle2 size={14}/> You're on the list. Welcome!
              </div>
            ) : (
              <form onSubmit={subscribe} data-testid="newsletter-form" className="flex items-center gap-2 bg-white/4 border border-white/10 rounded-full pl-4 pr-1 py-1 focus-within:border-[#1E6BFF]/50 transition">
                <input
                  data-testid="newsletter-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-[13px] outline-none py-1.5 min-w-0"
                />
                <button data-testid="newsletter-submit" type="submit" disabled={busy} className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center disabled:opacity-50">
                  <Send size={13} className="text-white"/>
                </button>
              </form>
            )}

            <div className="flex items-center gap-2 mt-6">
              {SOCIALS.map((s) => {
                const Icon = SocialIconMap[s.icon] || Mail;
                return (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="w-9 h-9 rounded-full glass flex items-center justify-center text-[#C9D2E0] hover:text-white hover:border-[#1E6BFF]/40 transition">
                    <Icon size={14}/>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="divider-line mt-6 mb-5" />
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[12px] text-[#6B7385]">
          <div>&copy; 2026 DortX Technologies. All Rights Reserved.</div>
          <div className="flex flex-wrap gap-5">
            <span>Empowering Business Through Technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
