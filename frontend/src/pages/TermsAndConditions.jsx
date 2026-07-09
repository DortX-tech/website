import { useEffect } from "react";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "company-information", title: "Company Information" },
  { id: "website-usage", title: "Website Usage" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "services", title: "Services" },
  { id: "quotes-estimates", title: "Quotes & Estimates" },
  { id: "payments", title: "Payments" },
  { id: "client-responsibilities", title: "Client Responsibilities" },
  { id: "limitation-liability", title: "Limitation of Liability" },
  { id: "confidentiality", title: "Confidentiality" },
  { id: "third-party-links", title: "Third-Party Links" },
  { id: "service-availability", title: "Service Availability" },
  { id: "ai-disclaimer", title: "AI Disclaimer" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

function Meta() {
  useEffect(() => {
    document.title = "Terms & Conditions | DortX Technologies";
    const description = "Terms and Conditions for DortX Technologies website, services, intellectual property, payments, client responsibilities, AI disclaimer, and governing law.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);
  return null;
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-white/8 pt-7">
      <h2 className="font-display text-[24px] sm:text-[28px] text-white font-semibold">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] sm:text-[16px] text-[#C9D2E0] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="grid sm:grid-cols-2 gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[#C9D2E0]">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#4D8BFF] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsAndConditions() {
  return (
    <div data-testid="terms-and-conditions-page">
      <Meta />
      <section className="relative pt-28 sm:pt-32 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Legal</div>
          <h1 className="font-display page-heading text-[clamp(2rem,5vw,3.5rem)] leading-[1.12] tracking-normal font-semibold mt-4 max-w-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            The terms that govern use of the DortX Technologies website and engagement with our software, AI, automation, and consulting services.
          </p>
          <div className="mt-5 text-[13px] text-[#6B7385]">Last Updated: July 2026</div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4">
            <nav aria-label="Terms and Conditions table of contents" className="lg:sticky lg:top-28 glass rounded-2xl p-5">
              <h2 className="font-display text-white text-[15px] font-semibold mb-4">Contents</h2>
              <ul className="space-y-2.5 text-[13.5px]">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-[#9AA3B8] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF] rounded">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="lg:col-span-8 space-y-7">
            <Section id="acceptance" title="Acceptance of Terms">
              <p>By using this website, contacting DortX Technologies, submitting information through forms, or engaging with our digital services, users agree to these Terms &amp; Conditions.</p>
            </Section>

            <Section id="company-information" title="Company Information">
              <div className="glass rounded-2xl p-5 space-y-2">
                <p className="font-display text-white text-[18px]">DortX Technologies</p>
                <p>Registered MSME (Government of India)</p>
                <p><span className="text-[#9AA3B8]">UDYAM Registration No.</span><br />UDYAM-KR-25-0108099</p>
              </div>
            </Section>

            <Section id="website-usage" title="Website Usage">
              <p>Users agree to use the website responsibly and lawfully. Users must not:</p>
              <BulletList items={["misuse the website", "attempt unauthorized access", "upload malicious content", "interfere with website operation"]} />
            </Section>

            <Section id="intellectual-property" title="Intellectual Property">
              <p>All content belongs to DortX Technologies, including the logo, branding, website design, graphics, source code, UI, documentation, written content, software, and AI workflows. No content may be copied, reproduced, modified, or redistributed without written permission.</p>
            </Section>

            <Section id="services" title="Services">
              <p>Information on this website is provided for general informational purposes only. Project scope, pricing, timelines, technical responsibilities, and deliverables are finalized only through written agreements, proposals, statements of work, or contracts accepted by both parties.</p>
            </Section>

            <Section id="quotes-estimates" title="Quotes & Estimates">
              <p>Any quotation, estimate, or proposal shared by DortX remains valid only for the specified period. If no period is stated, the quote may be revised based on scope, availability, technology requirements, or business changes.</p>
            </Section>

            <Section id="payments" title="Payments">
              <p>If applicable, invoices must be paid according to agreed payment terms. Late payments may delay project delivery, support, deployment, or handover until the account is regularized.</p>
            </Section>

            <Section id="client-responsibilities" title="Client Responsibilities">
              <p>Clients are responsible for timely collaboration and accurate inputs, including:</p>
              <BulletList items={["providing accurate information", "providing required assets", "reviewing deliverables", "providing timely approvals"]} />
            </Section>

            <Section id="limitation-liability" title="Limitation of Liability">
              <p>DortX Technologies shall not be liable for indirect, incidental, consequential, or special damages arising from use of the website or services. Liability shall never exceed the amount paid by the client for the specific service unless required by law.</p>
            </Section>

            <Section id="confidentiality" title="Confidentiality">
              <p>DortX respects confidential information shared by clients. Where applicable, separate non-disclosure agreements or project agreements may govern confidential projects and sensitive business information.</p>
            </Section>

            <Section id="third-party-links" title="Third-Party Links">
              <p>External websites, tools, platforms, or third-party services linked from this website remain governed by their own terms and policies. DortX is not responsible for third-party content, availability, or practices.</p>
            </Section>

            <Section id="service-availability" title="Service Availability">
              <p>DortX does not guarantee uninterrupted website availability. Maintenance, upgrades, hosting issues, security events, or unforeseen circumstances may temporarily affect access.</p>
            </Section>

            <Section id="ai-disclaimer" title="AI Disclaimer">
              <p>AI-generated responses are provided for informational purposes. Users and clients should independently verify critical business, legal, financial, medical, security, or compliance decisions before acting on AI-generated information.</p>
            </Section>

            <Section id="governing-law" title="Governing Law">
              <p>These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in Bengaluru, Karnataka, India.</p>
            </Section>

            <Section id="changes" title="Changes">
              <p>DortX may modify these Terms at any time to reflect legal, operational, or service changes. Continued use of the website after changes are published means users accept the updated Terms.</p>
              <p className="text-[#9AA3B8]">Last Updated: July 2026</p>
            </Section>

            <Section id="contact" title="Contact">
              <p>For questions about these Terms, contact DortX Technologies:</p>
              <div className="space-y-2">
                <p><a href="mailto:support@dortxtech.com" className="text-[#4D8BFF] hover:text-white hover:underline underline-offset-4 transition">support@dortxtech.com</a></p>
                <p><a href="mailto:thrisha@dortxtech.com" className="text-[#4D8BFF] hover:text-white hover:underline underline-offset-4 transition">thrisha@dortxtech.com</a></p>
                <p>
  <a
    href="tel:+919980091281"
    className="text-[#4D8BFF] hover:text-white"
  >
    +91 99800 91281
  </a>
  {" | "}
  <a
    href="tel:+918150990329"
    className="text-[#4D8BFF] hover:text-white"
  >
    +91 81509 90329
  </a>
</p>
              </div>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}
