import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "./Logo";
import { NAV_LINKS } from "@/data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 min-[390px]:px-5 lg:px-8">
        <div className={`flex items-center justify-between gap-3 sm:gap-6 rounded-full px-3 min-[390px]:px-4 lg:px-6 py-3 transition-all ${
          scrolled ? "glass-strong" : "glass"
        }`}>
          <Logo height={32} />

          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 text-[13.5px] rounded-full transition-all ${
                    isActive
                      ? "text-white bg-white/8"
                      : "text-[#9AA3B8] hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/contact"
            data-testid="nav-contact-cta"
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0A0F1C] text-[13.5px] font-semibold hover:bg-[#E5ECFF] transition"
          >
            Start a project <ArrowUpRight size={14} />
          </Link>

          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen(!open)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mx-3 min-[390px]:mx-5 mt-3 rounded-2xl glass-strong p-4 min-[390px]:p-5"
            data-testid="mobile-nav-panel"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-[15px] ${
                      isActive ? "bg-[#1E6BFF]/15 text-white" : "text-[#C9D2E0] hover:bg-white/5"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                data-testid="mobile-contact-cta"
                className="mt-3 btn-primary justify-center"
              >
                Start a project <ArrowUpRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
