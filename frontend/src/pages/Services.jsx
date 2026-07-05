import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import * as Lucide from "lucide-react";
import { ArrowUpRight, Check, Compass, Sparkles } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { WINGS } from "@/data/site";

const wingAccents = [
  "#4D8BFF",
  "#7DD3FC",
  "#22C55E",
  "#F59E0B",
  "#A78BFA",
  "#38BDF8",
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function WingNav({ active }) {
  return (
    <div className="sticky top-20 z-20 -mx-6 px-6 py-3 bg-[#05080F]/78 backdrop-blur-xl border-y border-white/8">
      <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {WINGS.map((w) => (
          <a
            key={w.id}
            href={`#${w.id}`}
            className={`service-nav-link shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-medium ${active === w.id ? "active" : ""}`}
          >
            {w.number} {w.name.split(" & ")[0]}
          </a>
        ))}
      </div>
    </div>
  );
}

function WingSection({ wing, index, accent, reduceMotion }) {
  const Icon = Lucide[wing.icon] || Sparkles;
  const reverse = index % 2 === 1;

  return (
    <motion.section
      id={wing.id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="relative scroll-mt-32 py-8 lg:py-12"
    >
      <div
        className={`premium-shell relative overflow-hidden p-5 sm:p-7 lg:p-9 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center ${reverse ? "" : ""}`}
        style={{ "--wing-accent": accent }}
      >
        <div className="absolute inset-0 bg-grid opacity-20"/>
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 7 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/2 ${reverse ? "-left-20" : "-right-20"} w-[360px] h-[360px] -translate-y-1/2 rounded-full blur-[78px]`}
          style={{ backgroundColor: accent }}
        />

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className={`relative lg:col-span-5 ${reverse ? "lg:col-start-8" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl border flex items-center justify-center" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}1f`, color: accent }}>
              <Icon size={24}/>
            </div>
            <div className="service-wing-num" aria-hidden="true">{wing.number}</div>
          </div>
          <h2 className="font-display mt-7 text-[26px] sm:text-[34px] leading-[1.08] font-semibold">{wing.name}</h2>
          <p className="mt-5 text-[15px] text-[#9AA3B8] leading-relaxed max-w-xl">{wing.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" data-testid={`service-cta-${wing.id}`} className="btn-primary">
              Discuss this wing <ArrowUpRight size={15}/>
            </Link>
            <span className="inline-flex min-h-[44px] items-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-[13px] text-[#C9D2E0]">
              {wing.services.length} focused capabilities
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.62, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          className={`relative lg:col-span-7 grid sm:grid-cols-2 gap-3 ${reverse ? "lg:col-start-1 lg:row-start-1" : ""}`}
        >
          {wing.services.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.012 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.28 }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
              className="premium-card p-4 sm:p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1f`, color: accent }}>
                  <Check size={15}/>
                </div>
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-[#6B7385]">Capability {String(i + 1).padStart(2, "0")}</div>
              </div>
              <div className="mt-4 font-display text-white font-semibold text-[15.5px] leading-tight">{s.title}</div>
              <p className="mt-2 text-[13px] text-[#8892A6] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default function Services() {
  const [active, setActive] = useState(WINGS[0]?.id);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const sections = WINGS.map((w) => document.getElementById(w.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div data-testid="services-page">
      <section className="pt-28 sm:pt-32 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="absolute -top-28 right-0 w-[520px] h-[520px] rounded-full bg-[#1E6BFF]/15 blur-[90px]"/>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-7xl mx-auto px-6 lg:px-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">
            <Compass size={13}/> Services
          </div>
          <h1 className="font-display page-heading text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] tracking-normal font-semibold mt-5 max-w-4xl">
            Six service wings - <span className="gradient-text">designed to compound</span>.
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            Each wing can stand alone, but the real leverage comes when product, AI, data, growth, IoT, and continuity reinforce one another.
          </p>
        </motion.div>
      </section>

      <WingNav active={active} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
        {WINGS.map((w, i) => (
          <WingSection
            key={w.id}
            wing={w}
            index={i}
            accent={wingAccents[i % wingAccents.length]}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 glass rounded-3xl p-5 lg:p-9 text-center">
          <SectionHeader align="center" eyebrow="Get started" title="Not sure where to begin?" subtitle="Tell us the business problem. We'll recommend the wing - or the combination - that fits best." />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-primary">Talk to us <ArrowUpRight size={16}/></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
