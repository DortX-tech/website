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
          <h1 className="font-display page-heading font-semibold mt-4 max-w-4xl">
            A disciplined seven-step <span className="gradient-text">delivery process</span>.
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            From the first conversation to long-term maintenance, we keep delivery transparent, quality-focused, and on schedule. Quality isn't something we promise at the end - it's how we build from day one.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 relative">
          <div className="absolute left-7 lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#1E6BFF]/30 to-transparent"/>
          <div className="space-y-8 lg:space-y-10">
            {PROCESS_STEPS.map((s, i) => {
              const Icon = Lucide[s.icon] || Lucide.Sparkles;
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5 }}
                  className={`relative lg:grid lg:grid-cols-2 gap-8 items-center`}
                >
                  <div className={`pl-20 lg:pl-0 ${left ? "lg:pr-12 lg:text-right" : "lg:col-start-2 lg:pl-12"}`}>
                    <div className="font-display text-[#243049] text-[44px] leading-none">{s.num}</div>
                    <h3 className="mt-3 font-display text-[22px] font-semibold text-white">{s.title}</h3>
                    <p className="mt-3 text-[14.5px] text-[#9AA3B8] leading-relaxed">{s.desc}</p>
                  </div>
                  <div className={`absolute left-0 top-0 lg:static lg:flex ${left ? "lg:col-start-2 lg:justify-start" : "lg:col-start-1 lg:row-start-1 lg:justify-end"}`}>
                    <div className="relative">
                      <div className="absolute left-7 lg:left-auto lg:right-auto lg:relative top-3 w-3 h-3 rounded-full bg-[#1E6BFF] shadow-[0_0_0_4px_rgba(30,107,255,0.2)]"/>
                      <div className="ml-16 lg:ml-0 w-14 h-14 rounded-2xl glass flex items-center justify-center text-[#4D8BFF]">
                        <Icon size={22}/>
                      </div>
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
