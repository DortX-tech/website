import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { ArrowUpRight, Quote, Sparkles } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import { MISSION, VISION, VALUES } from "@/data/site";

/* — Hero — */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  return (
    <section ref={ref} className="relative pt-28 sm:pt-32 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40"/>
      <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] rounded-full bg-[#1E6BFF]/20 blur-[80px]"/>
      <motion.div style={{ y }} className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF]">— About DortX</div>
        <h1 className="font-display page-heading font-semibold mt-6 max-w-5xl">
          A studio built for the <br className="hidden sm:block"/>
          <span className="italic font-normal text-[#4D8BFF]">business</span> behind the software.
        </h1>
        <p className="mt-6 text-[15px] sm:text-[18px] text-[#9AA3B8] max-w-2xl leading-[1.55]">
          DortX is a technology company focused on delivering high-quality AI, software, IoT, and automation solutions. We believe great software and connected systems are built through thoughtful engineering, attention to detail, and a commitment to delivering reliable solutions on time.
        </p>
      </motion.div>
    </section>
  );
}

/* — Why we started — */
function Story() {
  return (
    <section className="relative py-14">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-6">— Why we started DortX</div>
        <h2 className="font-display section-heading font-medium max-w-3xl">
          To build the kind of technology partner <br/>
          we always wished existed.
        </h2>

        <div className="mt-6 grid lg:grid-cols-12 gap-8 lg:gap-8">
          <div className="lg:col-span-7 space-y-7 text-[15.5px] text-[#C9D2E0] leading-[1.75]">
            <p>
              DortX started with a simple frustration. Too often, businesses invest in software and get back something that no one really enjoys using — slow products, dashboards nobody opens, AI experiments that never reach production.
            </p>
            <p>
              We thought the technology was rarely the actual problem. The missing piece was usually a different kind of conversation — one that begins with the business question, then carefully chooses the technology to match.
            </p>
            <p>
              So we started a company built around that conversation. A small team of engineers, designers, AI specialists and creative thinkers — bringing curiosity, transparency and care into every project we take on.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="sticky top-32 glass rounded-2xl p-5">
              <Quote className="text-[#4D8BFF] mb-4" size={22}/>
              <p className="font-display text-[18px] text-white leading-[1.5]">
                "We don't sell technology. We solve business problems using intelligent technology."
              </p>
              <div className="mt-4 text-[12px] uppercase tracking-[0.16em] text-[#6B7385]">— Our philosophy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* — Mission & Vision — */
function MissionVision() {
  const blocks = [
    { label: "Mission", body: MISSION },
    { label: "Vision",  body: VISION },
  ];
  return (
    <section className="relative py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-px bg-white/8 rounded-3xl overflow-hidden">
        {blocks.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#070B17] p-5 lg:p-8"
          >
            <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-6">— {b.label}</div>
            <p className="font-display text-[22px] sm:text-[28px] leading-[1.25] font-medium text-white">{b.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* — Beliefs (what makes us different, without exaggeration) — */
function Beliefs() {
  const items = [
    { t: "We're small on purpose", d: "Small teams move faster, decide better, and care more. We grow only when the right person walks in." },
    { t: "Curiosity is our default", d: "We don't pretend to know everything. We read, prototype, ship, learn — every week." },
    { t: "Quality is a habit, not a phase", d: "Code reviews, design critiques, testing — they're not steps we run before launch. They're how we work, daily." },
    { t: "Transparency or nothing", d: "Open scopes, open progress, open conversations. If something is going off-track, you'll hear it from us first." },
    { t: "Long-term partnerships beat one-off projects", d: "Most of our clients return for second and third engagements. That's the relationship we're after, from day one." },
    { t: "Your problem comes before our preferences", d: "Our tech stack is opinionated, but never religious. The right tool for your problem wins every time." },
  ];
  return (
    <section className="relative py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-5">— What makes us different</div>
        <h2 className="font-display section-heading font-medium max-w-3xl">
          Six things we genuinely believe.
        </h2>

        <div className="mt-6 divide-y divide-white/8">
          {items.map((x, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="grid lg:grid-cols-12 gap-5 py-7 group hover:bg-white/[0.02] px-4 -mx-4 rounded-2xl transition"
            >
              <div className="lg:col-span-1 font-display text-[#3B4660] text-[18px]">0{i + 1}</div>
              <div className="lg:col-span-4 font-display text-white text-[18px] font-semibold">{x.t}</div>
              <div className="lg:col-span-7 text-[14.5px] text-[#9AA3B8] leading-relaxed">{x.d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* — Values — */
function ValuesGrid() {
  return (
    <section className="relative py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-5">— Our values</div>
        <h2 className="font-display section-heading font-medium max-w-3xl">
          The principles we hire, build <br/> and communicate by.
        </h2>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.t}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.45 }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
              className="spotlight rounded-2xl border border-white/8 bg-white/[0.02] p-5"
            >
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-[#6B7385]">0{i + 1}</div>
              <div className="mt-3 font-display text-white text-[18px] font-semibold">{v.t}</div>
              <p className="mt-2 text-[13.5px] text-[#9AA3B8] leading-relaxed">{v.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* — Where we are going — */
function Future() {
  return (
    <section className="relative py-14">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <div className="text-[11.5px] tracking-[0.22em] uppercase text-[#4D8BFF] mb-6">— Where we're going</div>
        <h2 className="font-display section-heading font-medium">
          Build deeper. <br/>
          Stay small. <br/>
          <span className="gradient-text">Ship what matters.</span>
        </h2>
        <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl mx-auto leading-relaxed">
          Our roadmap isn't about agency-style expansion. It's about going deeper into AI, building thoughtful product accelerators, and staying the kind of team where every engagement still has a real human owner.
        </p>
        <MagneticButton strength={14} className="mt-6 inline-block">
          <Link to="/contact" className="btn-primary">Build with us <ArrowUpRight size={16}/></Link>
        </MagneticButton>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div data-testid="about-page">
      <Hero />
      <Story />
      <MissionVision />
      <ValuesGrid />
      <Beliefs />
      <Future />
    </div>
  );
}
