import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import * as Lucide from "lucide-react";
import { ArrowUpRight, ArrowRight, Sparkles, Code2, Brain, BarChart3, TrendingUp, Factory, ShieldCheck, Plus, Quote } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import useMouseParallax from "@/hooks/useMouseParallax";
import { WINGS, PROCESS_STEPS, TECH_GROUPS, INDUSTRIES, FAQS, TEAM } from "@/data/site";

const WingIcons = { Code2, Brain, BarChart3, TrendingUp, Factory, ShieldCheck };

/* ========================================================================
   01. HERO — cinematic, mouse-parallax, magnetic CTAs, animated orbs
   ======================================================================== */
function Hero() {
  const mouse = useMouseParallax();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative pt-28 sm:pt-32 pb-8 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40"/>
      {/* Animated gradient orbs (mouse-responsive) */}
      <div
        className="orb"
        style={{
          width: 520, height: 520,
          background: "radial-gradient(circle, #1E6BFF 0%, transparent 70%)",
          opacity: 0.35,
          left: `${20 + mouse.x * 12}%`, top: `${5 + mouse.y * 8}%`,
          transition: "left 800ms ease-out, top 800ms ease-out",
        }}
      />
      <div
        className="orb"
        style={{
          width: 420, height: 420,
          background: "radial-gradient(circle, #4D8BFF 0%, transparent 70%)",
          opacity: 0.22,
          right: `${10 + mouse.x * 8}%`, bottom: `${5 + (1 - mouse.y) * 10}%`,
          transition: "right 1000ms ease-out, bottom 1000ms ease-out",
        }}
      />
      {/* SVG mesh lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ln" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E6BFF" stopOpacity="0"/>
            <stop offset="50%" stopColor="#4D8BFF" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#1E6BFF" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[...Array(6)].map((_, i) => (
          <motion.line
            key={i}
            x1="0" y1={`${10 + i * 18}%`}
            x2="100%" y2={`${5 + i * 15}%`}
            stroke="url(#ln)" strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 2.2, delay: i * 0.15, ease: "easeOut" }}
          />
        ))}
      </svg>

      <motion.div style={{ y: y1, opacity }} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-[12px] text-[#C9D2E0]"
            >
              <span className="dot-pulse"/> A technology studio for businesses that need more than templates
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display hero-heading mt-6 font-semibold"
            >
              We solve <span className="italic font-normal text-[#4D8BFF]">business</span>
              <br/>
              problems with <span className="shimmer-text">intelligent</span>
              <br/>
              <span className="gradient-text">technology.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-[15.5px] sm:text-[18px] text-[#9AA3B8] max-w-xl leading-[1.55]"
            >
              DortX builds high-quality AI solutions, software, and automation systems that solve real business problems. Every project is engineered with precision, tested thoroughly, and delivered on time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <Link to="/services" data-testid="hero-cta-services" className="btn-ghost">
                Explore services <ArrowRight size={16}/>
              </Link>
              <MagneticButton strength={14}>
                <Link to="/contact" data-testid="hero-cta-start" className="btn-primary">
                  Start a project <ArrowUpRight size={16}/>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right side: floating technology orbit (decorative) */}
          <motion.div style={{ y: y2 }} className="hidden lg:block lg:col-span-4 relative h-[440px]">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Concentric rings */}
              {[180, 280, 380].map((s, i) => (
                <div key={i} className="absolute rounded-full border border-[#1E6BFF]/15" style={{ width: s, height: s }}/>
              ))}
              {/* Centre core */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-20 h-20 rounded-2xl glass flex items-center justify-center shadow-[0_0_60px_-10px_rgba(30,107,255,0.7)]"
              >
                <Sparkles className="text-[#4D8BFF]" size={26}/>
              </motion.div>
              {/* Orbiting nodes */}
              {[
                { icon: "Code2", r: 90, d: 0 },
                { icon: "Brain", r: 90, d: 5 },
                { icon: "BarChart3", r: 140, d: 2 },
                { icon: "TrendingUp", r: 140, d: 9 },
                { icon: "ShieldCheck", r: 190, d: 4 },
                { icon: "Database", r: 190, d: 13 },
              ].map((o, i) => {
                const Icon = Lucide[o.icon];
                return (
                  <div key={i} className="absolute orbit" style={{ "--r": `${o.r}px`, animationDelay: `-${o.d}s` }}>
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#C9D2E0]">
                      <Icon size={15}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom strip — values */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}
          className="mt-6 pt-6 border-t border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-5"
        >
          {[
            { k: "Team", v: "Small & focused" },
            { k: "Service wings", v: "Six disciplines" },
            { k: "Engagement", v: "Outcome-led" },
            { k: "IP ownership", v: "100% yours" },
          ].map((x, i) => (
            <div key={i}>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#6B7385]">{x.k}</div>
              <div className="mt-2 font-display text-[18px] text-white">{x.v}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ========================================================================
   02. INTRO — "Why DortX exists" — quiet, narrative, full-width statement
   ======================================================================== */
function WhyExist() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const op1 = useTransform(scrollYProgress, [0.2, 0.5], [0.3, 1]);
  const op2 = useTransform(scrollYProgress, [0.4, 0.7], [0.2, 1]);

  return (
    <section ref={ref} className="relative py-14 lg:py-16">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-[11.5px] tracking-[0.2em] uppercase text-[#4D8BFF] mb-6">— Why we exist</div>

        <motion.p style={{ opacity: op1 }} className="font-display text-[28px] sm:text-[38px] lg:text-[48px] leading-[1.15] font-medium">
          We kept seeing the same pattern.
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-8 mt-6">
          <motion.p style={{ opacity: op2 }} className="text-[15.5px] sm:text-[16px] text-[#C9D2E0] leading-[1.7]">
            Companies investing heavily in software — and getting back generic outputs. Slow products. Dashboards no one opens. AI experiments that never see production. Marketing money that disappears into the void.
          </motion.p>
          <motion.p style={{ opacity: op2 }} className="text-[15.5px] sm:text-[16px] text-[#9AA3B8] leading-[1.7]">
            DortX was started to be the opposite of that. A small, focused team that treats every engagement like our own product — with care, ownership and the standards we'd expect for ourselves.
          </motion.p>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <div className="h-px flex-1 bg-gradient-to-r from-[#1E6BFF]/40 to-transparent"/>
          <Link to="/about" className="text-[13px] text-[#C9D2E0] hover:text-white flex items-center gap-2">
            Read the full story <ArrowRight size={14}/>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================
   03. PROBLEMS — "The friction we remove" — split, asymmetric
   ======================================================================== */
function Problems() {
  const items = [
    { n: "I", t: "Software that nobody uses", d: "Generic, slow products built by teams who never asked the right questions." },
    { n: "II", t: "AI experiments that never ship", d: "Pilots, demos, decks. Then silence. The model never reaches a real workflow." },
    { n: "III", t: "Dashboards full of noise", d: "Vanity metrics nobody trusts. Decisions still made on instinct, not evidence." },
    { n: "IV", t: "Growth that doesn't compound", d: "Ad spend without measurement. SEO without architecture. Brand without positioning." },
  ];

  return (
    <section className="relative py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 lg:sticky lg:top-32 self-start">
            <div className="text-[11.5px] tracking-[0.2em] uppercase text-[#4D8BFF]">— What we remove</div>
            <h2 className="font-display section-heading font-semibold mt-5">
              The four frictions <br/> we hear about <br/>
              <span className="gradient-text">every week</span>.
            </h2>
            <p className="mt-6 text-[15.5px] text-[#9AA3B8] leading-relaxed max-w-md">
              Most of our engagements start with one of these stories. They sound different on the surface — but the underlying problem is almost always the same.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {items.map((it, i) => (
              <motion.div
                key={it.n}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                className="spotlight glass rounded-2xl p-5 flex items-start gap-5 group"
              >
                <div className="font-display text-[34px] text-[#243049] leading-none">{it.n}</div>
                <div className="flex-1">
                  <h3 className="font-display text-[18px] font-semibold text-white">{it.t}</h3>
                  <p className="mt-2 text-[14px] text-[#9AA3B8] leading-relaxed">{it.d}</p>
                </div>
                <ArrowUpRight className="text-[#4D8BFF] opacity-0 group-hover:opacity-100 transition" size={18}/>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================
   04. APPROACH — How we work as a system
   ======================================================================== */
function Approach() {
  return (
    <section className="relative py-14">
      <div className="absolute inset-0 hair-diag opacity-40"/>
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <div className="text-[11.5px] tracking-[0.2em] uppercase text-[#4D8BFF] mb-6">— Our approach</div>
        <h2 className="font-display section-heading font-medium max-w-4xl mx-auto">
          One small team. <span className="text-[#4D8BFF]">Six disciplines.</span> <br className="hidden sm:block"/>
          Working as a single system.
        </h2>
        <p className="mt-5 text-[15.5px] text-[#9AA3B8] max-w-2xl mx-auto leading-relaxed">
          Most agencies separate engineering, design, AI, growth, industrial automation and security into different silos. We don't. They reinforce each other - so we run them as one practice, on one project, with one team.
        </p>

        <div className="mt-6 relative h-[260px] sm:h-[320px]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="cg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1E6BFF" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#1E6BFF" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="400" cy="160" r="120" fill="url(#cg)"/>
            {WINGS.map((_, i) => {
              const a = (i / WINGS.length) * Math.PI * 2 - Math.PI / 2;
              const x = 400 + Math.cos(a) * 120;
              const y = 160 + Math.sin(a) * 120;
              return (
                <g key={i}>
                  <line x1="400" y1="160" x2={x} y2={y} stroke="#1E6BFF" strokeOpacity="0.25" strokeDasharray="3 3"/>
                </g>
              );
            })}
          </svg>
          {WINGS.map((w, i) => {
            const a = (i / WINGS.length) * 360 - 90;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                className="absolute"
                style={{
                  left: `calc(50% + ${Math.cos((a * Math.PI) / 180) * 38}% - 50px)`,
                  top: `calc(50% + ${Math.sin((a * Math.PI) / 180) * 38}% - 26px)`,
                }}
              >
                <div className="px-4 py-2.5 rounded-full glass text-[12.5px] text-white whitespace-nowrap">
                  {w.name.split(" & ")[0]}
                </div>
              </motion.div>
            );
          })}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center shadow-[0_0_60px_-10px_rgba(30,107,255,0.8)]">
            <Sparkles className="text-white" size={20}/>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================
   05. WINGS — six disciplines, each in a unique row layout (not a grid)
   ======================================================================== */
function WingRow({ wing, index }) {
  const Icon = WingIcons[wing.icon] || Sparkles;
  const isReverse = index % 2 === 1;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} id={wing.id} className="relative py-14 lg:py-16 scroll-mt-32">
      <div className={`absolute ${isReverse ? "right-0" : "left-0"} top-0 rail-num`}>
        {wing.number}
      </div>

      <div className={`relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-8 items-center ${isReverse ? "lg:flex-row-reverse" : ""}`}>
        <motion.div
          initial={{ opacity: 0, x: isReverse ? 40 : -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className={`lg:col-span-6 ${isReverse ? "lg:col-start-7" : ""}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl glass flex items-center justify-center text-[#4D8BFF]">
              <Icon size={20}/>
            </div>
            <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#6B7385]">Wing {wing.number}</div>
          </div>
          <h3 className="font-display text-[28px] sm:text-[38px] leading-[1.05] font-semibold">{wing.name}</h3>
          <p className="mt-5 text-[15px] text-[#9AA3B8] leading-relaxed max-w-lg">{wing.description}</p>
          <Link to={`/services#${wing.id}`} className="mt-6 inline-flex btn-ghost">
            Explore this wing <ArrowUpRight size={15}/>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: isReverse ? -40 : 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`lg:col-span-6 ${isReverse ? "lg:col-start-1 lg:row-start-1" : ""}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wing.services.map((s, i) => (
              <div
                key={i}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                className="spotlight rounded-2xl border border-white/8 bg-white/[0.02] p-5 hover:border-[#1E6BFF]/35 transition"
              >
                <div className="flex items-center gap-2 text-[#4D8BFF] mb-3">
                  <Plus size={14}/>
                  <span className="text-[10.5px] uppercase tracking-[0.16em] text-[#6B7385]">0{i + 1}</span>
                </div>
                <div className="font-display text-white font-semibold text-[15.5px] leading-tight">{s.title}</div>
                <p className="mt-2 text-[12.5px] text-[#8892A6] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Wings() {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-6 pt-16">
        <div className="text-[11.5px] tracking-[0.2em] uppercase text-[#4D8BFF] mb-5">— The six wings</div>
        <h2 className="font-display section-heading font-semibold max-w-4xl">
          Each wing is a focused practice <br/>
          in its own right.
        </h2>
      </div>
      <div className="divide-y divide-white/6">
        {WINGS.map((w, i) => <WingRow key={w.id} wing={w} index={i}/>)}
      </div>
    </section>
  );
}

/* ========================================================================
   06. PROCESS — vertical timeline with progress line
   ======================================================================== */
function ProcessTimeline() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 30%"] });
  const lineH = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), { stiffness: 60, damping: 18 });

  return (
    <section ref={ref} className="relative py-14">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-[11.5px] tracking-[0.2em] uppercase text-[#4D8BFF] mb-5">— How we deliver</div>
        <h2 className="font-display section-heading font-semibold max-w-3xl">
          Seven steps. Predictable delivery. <span className="gradient-text">Zero surprises.</span>
        </h2>

        <div className="relative mt-6 pl-12 sm:pl-20">
          {/* Track */}
          <div className="absolute left-3 sm:left-7 top-0 bottom-0 w-px bg-white/8"/>
          <motion.div style={{ height: lineH }} className="absolute left-3 sm:left-7 top-0 w-px bg-gradient-to-b from-[#1E6BFF] via-[#4D8BFF] to-transparent"/>

          <div className="space-y-9">
            {PROCESS_STEPS.map((s, i) => {
              const Icon = Lucide[s.icon] || Sparkles;
              return (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="absolute -left-[34px] sm:-left-[58px] top-1">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full glass-strong flex items-center justify-center text-[#4D8BFF]">
                      <Icon size={13}/>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-[#3B4660] text-[14px]">{s.num}</span>
                    <h3 className="font-display text-[18px] sm:text-[22px] font-semibold">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-[14.5px] text-[#9AA3B8] leading-relaxed max-w-2xl">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================
   07. TECH MARQUEE — animated, dual-row
   ======================================================================== */
function TechMarquee() {
  const all = TECH_GROUPS.flatMap((g) => g.items);
  const row1 = [...all, ...all];
  const row2 = [...all.reverse(), ...all];
  return (
    <section className="relative py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-6">
        <div className="text-[11.5px] tracking-[0.2em] uppercase text-[#4D8BFF] mb-5">— The stack</div>
        <h2 className="font-display section-heading font-semibold max-w-3xl">
          Modern, polyglot, <br/>chosen for <span className="gradient-text">fit</span>.
        </h2>
      </div>
      <div className="space-y-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="overflow-hidden">
          <div className="flex gap-3 marquee-track w-max">
            {row1.map((t, i) => (
              <div key={i} className="px-5 py-2.5 rounded-full glass text-[13px] text-[#C9D2E0] whitespace-nowrap">{t}</div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-3 marquee-track w-max" style={{ animationDirection: "reverse", animationDuration: "44s" }}>
            {row2.map((t, i) => (
              <div key={i} className="px-5 py-2.5 rounded-full border border-white/8 bg-white/[0.02] text-[13px] text-[#8892A6] whitespace-nowrap">{t}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================
   08. TEAM SHORT — horizontal card scroll teaser
   ======================================================================== */
function TeamTeaser() {
  return (
    <section className="relative py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between gap-5 mb-6">
          <div>
            <div className="text-[11.5px] tracking-[0.2em] uppercase text-[#4D8BFF] mb-5">— The team</div>
            <h2 className="font-display section-heading font-semibold max-w-2xl">
              Passionate builders. <span className="text-[#4D8BFF]">Quality-first by habit.</span>
            </h2>
          </div>
          <Link to="/team" className="hidden sm:inline-flex btn-ghost">Meet everyone <ArrowRight size={15}/></Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {TEAM.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="card-glow p-4 aspect-[3/4] flex flex-col justify-end relative overflow-hidden"
            >
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F1830] via-[#0A0F1C] to-[#0F1830]"/>
                <div className="absolute inset-0 bg-grid opacity-30"/>
                <div className="absolute -top-5 -right-6 w-32 h-32 rounded-full bg-[#1E6BFF]/15 blur-2xl"/>
                <div className="absolute top-5 left-6 font-display text-[36px] gradient-text opacity-90">
                  {m.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
                </div>
              </div>
              <div className="relative z-10">
                <div className="font-display text-white text-[14.5px] font-semibold leading-tight">{m.name}</div>
                <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#4D8BFF] mt-1.5 line-clamp-1">{m.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================
   09. INDUSTRIES — tag cloud with subtle scale
   ======================================================================== */
/* ========================================================================
   09. INDUSTRIES — minimal enterprise chips
   ======================================================================== */
function Industries() {
  return (
    <section className="relative py-14">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-5">— Industries we empower</div>
          <h2 className="font-display section-heading font-medium">
            Industries we empower.
          </h2>
          <p className="mt-5 text-[15.5px] sm:text-[16px] text-[#9AA3B8] leading-relaxed">
            We build intelligent digital solutions tailored to the unique challenges of every industry we serve.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {INDUSTRIES.map((ind, i) => (
            <motion.span
              key={ind.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, delay: Math.min(i, 14) * 0.015 }}
              className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-[13px] text-[#C9D2E0] hover:text-white hover:border-[#1E6BFF]/40 hover:bg-white/[0.04] transition-colors duration-200"
            >
              {ind.name}
            </motion.span>
          ))}

          {/* Accent chip */}
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="px-3.5 py-1.5 rounded-full border border-[#1E6BFF]/40 bg-[#1E6BFF]/10 text-[13px] text-[#9DB8FF] hover:text-white hover:bg-[#1E6BFF]/20 hover:border-[#1E6BFF]/60 transition-colors duration-200 inline-flex items-center gap-1"
          >
            <span className="text-[#4D8BFF]">+</span> Many More Industries
          </motion.span>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================
   10. FAQ — compact accordion
   ======================================================================== */
function FAQTeaser() {
  const [open, setOpen] = useState(0);
  const list = FAQS.slice(0, 6);
  return (
    <section className="relative py-14">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="text-[11.5px] tracking-[0.2em] uppercase text-[#4D8BFF] mb-5">— FAQ</div>
          <h2 className="font-display section-heading font-semibold">
            Common questions, <br/>honestly answered.
          </h2>
          <Link to="/faq" className="mt-6 inline-flex btn-ghost">All questions <ArrowRight size={15}/></Link>
        </div>
        <div className="lg:col-span-8 glass rounded-2xl divide-y divide-white/8">
          {list.map((f, i) => (
            <button key={i} data-testid={`faq-item-${i}`} onClick={() => setOpen(open === i ? -1 : i)} className="w-full text-left px-6 py-5 hover:bg-white/[0.03] transition">
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-white font-medium text-[15.5px]">{f.q}</span>
                <Plus size={16} className={`text-[#4D8BFF] transition-transform ${open === i ? "rotate-45" : ""}`}/>
              </div>
              {open === i && <p className="mt-3 text-[14px] text-[#9AA3B8] leading-relaxed">{f.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================
   11. FINAL CTA — large editorial moment
   ======================================================================== */
function FinalCTA() {
  return (
    <section className="relative py-14">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 p-5 lg:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1430] via-[#05080F] to-[#0A1430]"/>
          <div className="absolute inset-0 bg-grid opacity-30"/>
          <div className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-[#1E6BFF]/20 blur-[80px]"/>

          <div className="relative">
            <Quote className="text-[#4D8BFF] mb-4" size={28}/>
            <h3 className="font-display section-heading font-semibold max-w-3xl">
              Have a problem worth <span className="italic font-normal text-[#4D8BFF]">solving</span>?
            </h3>
            <p className="mt-5 text-[15.5px] text-[#9AA3B8] max-w-xl leading-relaxed">
              Tell us about your business and what you're trying to change. We reply within one working day — usually faster — and we mean it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <MagneticButton strength={16}>
                <Link to="/contact" data-testid="cta-start-conversation" className="btn-primary !py-3 !px-6 text-[14px]">
                  Start a conversation <ArrowUpRight size={17}/>
                </Link>
              </MagneticButton>
              <a href="mailto:support@dortxtech.com" className="btn-ghost">support@dortxtech.com</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================================== */
export default function Home() {
  return (
    <div data-testid="home-page">
      <Hero />
      <WhyExist />
      <Problems />
      <Approach />
      <Wings />
      <ProcessTimeline />
      <TechMarquee />
      <Industries />
      <FAQTeaser />
      <FinalCTA />
    </div>
  );
}
