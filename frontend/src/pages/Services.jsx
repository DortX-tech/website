import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import * as Lucide from "lucide-react";
import { ArrowUpRight, Check } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { WINGS } from "@/data/site";

export default function Services() {
  return (
    <div data-testid="services-page">
      <section className="pt-28 sm:pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Services</div>
          <h1 className="font-display page-heading text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] tracking-normal font-semibold mt-4 max-w-4xl">
            Six service wings - <span className="gradient-text">built to compound</span>.
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            From product engineering to AI agents, dashboards, growth, industrial automation and security - every wing reinforces the others. Use one. Or use them as a system.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          {WINGS.map((w, idx) => {
            const Icon = Lucide[w.icon] || Lucide.Sparkles;
            return (
              <motion.div
                key={w.id}
                id={w.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6 }}
                className="card-glow p-5 lg:p-10 scroll-mt-24"
              >
                <div className="grid lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#1E6BFF]/15 flex items-center justify-center text-[#4D8BFF] border border-[#1E6BFF]/25">
                        <Icon size={24}/>
                      </div>
                      <div className="font-display text-[38px] text-[#243049] leading-none">{w.number}</div>
                    </div>
                    <h2 className="font-display text-[24px] lg:text-[32px] font-semibold leading-tight">{w.name}</h2>
                    <p className="mt-5 text-[15px] text-[#9AA3B8] leading-relaxed">{w.description}</p>
                    <Link to="/contact" data-testid={`service-cta-${w.id}`} className="mt-6 inline-flex btn-ghost">
                      Discuss this wing <ArrowUpRight size={15}/>
                    </Link>
                  </div>
                  <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
                    {w.services.map((s, i) => (
                      <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-5 hover:border-[#1E6BFF]/30 transition">
                        <Check className="text-[#4D8BFF]" size={16}/>
                        <div className="mt-3 font-display text-white font-semibold text-[15.5px]">{s.title}</div>
                        <p className="mt-1.5 text-[13px] text-[#8892A6] leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 glass rounded-3xl p-5 lg:p-9 text-center">
          <SectionHeader align="center" eyebrow="Get started" title="Not sure where to begin?" subtitle="Tell us the business problem. We'll recommend the wing — or the combination — that fits best." />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-primary">Talk to us <ArrowUpRight size={16}/></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
