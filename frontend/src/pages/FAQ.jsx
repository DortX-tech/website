import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { FAQS } from "@/data/site";

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <div data-testid="faq-page">
      <section className="pt-28 sm:pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">FAQ</div>
          <h1 className="font-display page-heading text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] tracking-normal font-semibold mt-4 max-w-4xl">
            Every question, <span className="gradient-text">honestly answered</span>.
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="premium-shell rounded-2xl divide-y divide-white/8 overflow-hidden">
            {FAQS.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.035 }}>
                <button data-testid={`faq-question-${i}`} onClick={() => setOpen(open === i ? -1 : i)} className="w-full text-left px-4 sm:px-6 py-5 hover:bg-white/[0.03] transition">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-display text-white font-medium text-[15.5px]">{f.q}</span>
                    <Plus size={16} className={`text-[#4D8BFF] transition-transform ${open === i ? "rotate-45" : ""}`}/>
                  </div>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-[14px] text-[#9AA3B8] leading-relaxed">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
