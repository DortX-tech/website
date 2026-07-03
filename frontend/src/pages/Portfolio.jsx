import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const portfolioItems = [];

export default function Portfolio() {
  return (
    <div data-testid="portfolio-page">
      <section className="pt-28 sm:pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-grid opacity-40"/>
        <div className="absolute inset-0 bg-radial-glow"/>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Portfolio</div>
          <h1 className="font-display text-[36px] sm:text-[50px] lg:text-[60px] leading-[1.05] font-semibold mt-4 max-w-4xl">
            Our work, coming soon.
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            We're preparing selected case studies and project highlights.
          </p>
        </div>
      </section>

      {portfolioItems.length > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Real portfolio cards can be rendered here when case studies are ready. */}
          </div>
        </section>
      )}

      <section className="py-14">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 glass rounded-3xl p-5 sm:p-8 text-center">
          <h3 className="font-display text-[24px] font-semibold">Want to be one of our launch case studies?</h3>
          <p className="mt-4 text-[15px] text-[#9AA3B8]">We're partnering with a small cohort of early clients to co-build flagship projects with full transparency.</p>
          <Link to="/contact" data-testid="portfolio-cta" className="mt-6 inline-flex btn-primary">Apply to partner with us <ArrowUpRight size={16}/></Link>
        </div>
      </section>
    </div>
  );
}
