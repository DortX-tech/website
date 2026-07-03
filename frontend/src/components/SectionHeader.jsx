import { motion } from "framer-motion";

export default function SectionHeader({ eyebrow, title, subtitle, align = "left" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <div className={`inline-flex items-center gap-2 text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF] font-medium mb-4 ${align === "center" ? "mx-auto" : ""}`}>
          <span className="w-6 h-px bg-[#4D8BFF]"/> {eyebrow}
        </div>
      )}
      <h2 className="font-display text-[30px] sm:text-[40px] lg:text-[46px] leading-[1.05] font-semibold text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-[15px] sm:text-[16px] text-[#9AA3B8] leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
