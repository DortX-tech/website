import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { PROCESS_STEPS } from "@/data/site";

export default function Process() {
  return (
    <div data-testid="process-page">
      <section className="pt-28 sm:pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Process</div>
          <h1 className="font-display page-heading text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] tracking-normal font-semibold mt-4 max-w-4xl">
            A disciplined seven-step <span className="gradient-text">delivery process</span>.
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            From the first conversation to long-term maintenance, we keep delivery transparent, quality-focused, and on schedule. Quality isn't something we promise at the end - it's how we build from day one.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative">
          <div className="absolute left-[2.65rem] sm:left-[3.15rem] lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#1E6BFF]/30 to-transparent"/>
          <div className="space-y-8 lg:space-y-10">
            {PROCESS_STEPS.map((s, i) => {
              const Icon = Lucide[s.icon] || Lucide.Sparkles;
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5 }}
                  className={`relative lg:grid lg:grid-cols-2 gap-8 items-center`}
                >
                  <div className={`premium-card p-5 pl-20 sm:pl-24 lg:pl-5 ${left ? "lg:pr-12 lg:text-right" : "lg:col-start-2 lg:pl-12"}`}>
                    <div className="font-display text-[#243049] text-[44px] leading-none">{s.num}</div>
                    <h3 className="mt-3 font-display text-[22px] font-semibold text-white">{s.title}</h3>
                    <p className="mt-3 text-[14.5px] text-[#9AA3B8] leading-relaxed">{s.desc}</p>
                  </div>
                  <div className={`absolute left-4 sm:left-6 top-0 lg:static lg:flex ${left ? "lg:col-start-2 lg:justify-start" : "lg:col-start-1 lg:row-start-1 lg:justify-end"}`}>
                    <div className="relative z-10 w-14 h-14 rounded-2xl glass-strong flex items-center justify-center text-[#4D8BFF] shadow-[0_0_0_6px_rgba(5,8,15,0.94),0_0_32px_-12px_rgba(77,139,255,0.8)]">
                      <Icon size={22}/>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
