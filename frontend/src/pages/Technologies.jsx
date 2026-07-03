import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";
import { TECH_GROUPS } from "@/data/site";

export default function Technologies() {
  return (
    <div data-testid="technologies-page">
      <section className="pt-28 sm:pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Technologies</div>
          <h1 className="font-display page-heading text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] tracking-normal font-semibold mt-4 max-w-4xl">
            A modern stack — <span className="gradient-text">chosen for fit</span>.
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            We're polyglot by training and pragmatic by habit. Here are the technologies we work with most often, grouped by where they sit in your system.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TECH_GROUPS.map((g, i) => (
            <motion.div
              key={g.group}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="card-glow p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="font-display text-white font-semibold text-[15.5px]">{g.group}</div>
                <span className="text-[#3B4660] font-display text-[12px]">0{i + 1}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-[12.5px] text-[#C9D2E0] hover:border-[#1E6BFF]/40 transition">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
