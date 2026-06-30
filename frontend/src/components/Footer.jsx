import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowUpRight, CheckCircle2, Instagram, Linkedin, Facebook, Twitter, Youtube, Send } from "lucide-react";
import axios from "axios";
import Logo from "./Logo";
import { CONTACT, SOCIALS } from "@/data/site";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SocialIconMap = { Instagram, Linkedin, Facebook, Twitter, Youtube };

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email || busy) return;
    setBusy(true);
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email, source: "footer" });
      setDone(true);
      setEmail("");
    } catch (err) {
      // 409/duplicate is fine, anything else we still acknowledge gracefully
      if (err?.response?.status && err.response.status < 500) {
        setDone(true);
      } else {
        alert("Couldn't subscribe right now — please try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer data-testid="main-footer" className="relative mt-32 border-t border-white/8">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#1E6BFF]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand + description */}
          <div className="lg:col-span-4">
            <Logo height={120} variant="full" />
            <p className="mt-6 text-[#9AA3B8] text-[14.5px] leading-relaxed max-w-sm">
              DortX is a young technology company building thoughtful software, AI systems and growth tools for businesses that want quality over hype.
            </p>
            <Link to="/contact" data-testid="footer-cta" className="mt-6 inline-flex btn-primary">
              Start a conversation <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-display text-white text-[13px] font-semibold mb-4 tracking-wide">Company</h4>
            <ul className="space-y-2.5 text-[13.5px]">
              <li><Link to="/about" className="text-[#9AA3B8] hover:text-white">About</Link></li>
              <li><Link to="/team" className="text-[#9AA3B8] hover:text-white">Team</Link></li>
              <li><Link to="/careers" className="text-[#9AA3B8] hover:text-white">Careers</Link></li>
              <li><Link to="/faq" className="text-[#9AA3B8] hover:text-white">FAQ</Link></li>
              <li><Link to="/contact" className="text-[#9AA3B8] hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Service Wings */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-white text-[13px] font-semibold mb-4 tracking-wide">Service Wings</h4>
            <ul className="space-y-2.5 text-[13.5px]">
              <li><Link to="/services#software" className="text-[#9AA3B8] hover:text-white">Software Development</Link></li>
              <li><Link to="/services#ai" className="text-[#9AA3B8] hover:text-white">Cognitive Automation & AI</Link></li>
              <li><Link to="/services#data" className="text-[#9AA3B8] hover:text-white">Data Intelligence</Link></li>
              <li><Link to="/services#growth" className="text-[#9AA3B8] hover:text-white">Strategic Growth</Link></li>
              <li><Link to="/services#security" className="text-[#9AA3B8] hover:text-white">Continuity & Security</Link></li>
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-white text-[13px] font-semibold mb-4 tracking-wide">Get in touch</h4>
            <div className="space-y-1.5 text-[13.5px]">
              <a href={`mailto:${CONTACT.support}`} className="text-[#C9D2E0] hover:text-white flex items-center gap-2">
                <Mail size={13}/> {CONTACT.support}
              </a>
              <a href={`mailto:${CONTACT.founder}`} className="text-[#9AA3B8] hover:text-white flex items-center gap-2">
                <Mail size={13}/> {CONTACT.founder}
              </a>
            </div>

            <h4 className="font-display text-white text-[13px] font-semibold mt-7 mb-3 tracking-wide">Newsletter</h4>
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

            <div className="flex items-center gap-2 mt-7">
              {SOCIALS.map((s) => {
                const Icon = SocialIconMap[s.icon] || Mail;
                return (
                  <a key={s.name} href={s.url} aria-label={s.name} className="w-9 h-9 rounded-full glass flex items-center justify-center text-[#C9D2E0] hover:text-white hover:border-[#1E6BFF]/40 transition">
                    <Icon size={14}/>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="divider-line mt-14 mb-6" />
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[12px] text-[#6B7385]">
          <div>© {year} DortX. All rights reserved.</div>
          <div className="flex flex-wrap gap-6">
            <span>Empowering Business Through Technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
