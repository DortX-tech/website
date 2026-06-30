import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Construction, ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

export default function Portfolio() {
  const placeholders = [
    { tag: "Software Development" },
    { tag: "Cognitive Automation & AI" },
    { tag: "Data Intelligence" },
    { tag: "Strategic Growth" },
    { tag: "Continuity & Security" },
    { tag: "Custom Engineering" },
  ];

  return (
    <div data-testid="portfolio-page">
      <section className="pt-36 pb-12 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Portfolio</div>
          <h1 className="font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1.02] font-semibold mt-4 max-w-4xl">
            Our work, <span className="gradient-text">coming soon</span>.
          </h1>
          <p className="mt-6 text-[17px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            Our portfolio is currently under development. We're building exceptional digital solutions that will be showcased here soon — with full case studies, outcomes and lessons learned.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[13px] text-[#C9D2E0]">
            <Construction size={14} className="text-[#4D8BFF]"/> Showcase in progress
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {placeholders.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="card-glow p-6 group"
              >
                <div className="aspect-[16/10] rounded-xl mb-5 relative overflow-hidden border border-white/8 bg-gradient-to-br from-[#0A0F1C] via-[#0D1426] to-[#111C36]">
                  <div className="absolute inset-0 bg-grid opacity-30"/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                      className="w-24 h-24 rounded-full border border-[#1E6BFF]/30 flex items-center justify-center"
                    >
                      <Sparkles className="text-[#4D8BFF]" size={22}/>
                    </motion.div>
                  </div>
                  <div className="absolute bottom-3 left-3 text-[10.5px] tracking-[0.16em] uppercase text-[#6B7385]">{p.tag}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-white font-semibold text-[15.5px]">Case study in progress</div>
                    <div className="text-[12.5px] text-[#6B7385] mt-1">Details will appear here soon</div>
                  </div>
                  <span className="text-[11px] text-[#4D8BFF] px-2.5 py-1 rounded-full border border-[#1E6BFF]/30">Coming Soon</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 glass rounded-3xl p-10 text-center">
          <h3 className="font-display text-[28px] font-semibold">Want to be one of our launch case studies?</h3>
          <p className="mt-4 text-[15px] text-[#9AA3B8]">We're partnering with a small cohort of early clients to co-build flagship projects with full transparency.</p>
          <Link to="/contact" data-testid="portfolio-cta" className="mt-6 inline-flex btn-primary">Apply to partner with us <ArrowUpRight size={16}/></Link>
        </div>
      </section>
    </div>
  );
}
