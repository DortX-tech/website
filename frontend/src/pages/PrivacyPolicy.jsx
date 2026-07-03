import { useEffect } from "react";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-use-information", title: "How We Use Information" },
  { id: "ai-assistant", title: "AI Assistant" },
  { id: "cookies", title: "Cookies" },
  { id: "data-security", title: "Data Security" },
  { id: "third-party-services", title: "Third-Party Services" },
  { id: "data-retention", title: "Data Retention" },
  { id: "user-rights", title: "User Rights" },
  { id: "childrens-privacy", title: "Children's Privacy" },
  { id: "international-users", title: "International Users" },
  { id: "changes", title: "Changes to Privacy Policy" },
  { id: "contact", title: "Contact" },
];

function Meta() {
  useEffect(() => {
    document.title = "Privacy Policy | DortX Technologies";
    const description = "Privacy Policy for DortX Technologies, covering personal information, AI assistant conversations, cookies, security, user rights, and contact details.";
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

export default function PrivacyPolicy() {
  return (
    <div data-testid="privacy-policy-page">
      <Meta />
      <section className="relative pt-28 sm:pt-32 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-[11.5px] tracking-[0.18em] uppercase text-[#4D8BFF]">Legal</div>
          <h1 className="font-display page-heading font-semibold mt-4 max-w-4xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-[15.5px] text-[#9AA3B8] max-w-2xl leading-relaxed">
            How DortX Technologies collects, uses, protects, and manages information shared through our website, services, forms, and AI assistant.
          </p>
          <div className="mt-5 text-[13px] text-[#6B7385]">Last Updated: July 2026</div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4">
            <nav aria-label="Privacy Policy table of contents" className="lg:sticky lg:top-28 glass rounded-2xl p-5">
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
            <Section id="introduction" title="Introduction">
              <p>DortX Technologies respects user privacy and is committed to protecting personal information shared with us. This Privacy Policy explains how we handle information collected through our website, contact forms, AI assistant, business enquiries, and related digital services.</p>
            </Section>

            <Section id="information-we-collect" title="Information We Collect">
              <p>Depending on how you interact with DortX, we may collect the following information when voluntarily submitted or automatically generated through website use:</p>
              <BulletList items={["Name", "Company Name", "Email Address", "Phone Number", "Country", "Project Requirements", "Files voluntarily shared", "Information submitted through forms", "AI chatbot conversations", "Website usage information", "Cookies", "Analytics information"]} />
            </Section>

            <Section id="how-we-use-information" title="How We Use Information">
              <p>We use collected information to understand enquiries, communicate clearly, and provide technology consulting and software development services. DortX never sells personal information.</p>
              <BulletList items={["responding to enquiries", "project communication", "quotations", "software development", "AI consultation", "customer support", "improving services", "improving the website", "improving the AI assistant", "legal compliance"]} />
            </Section>

            <Section id="ai-assistant" title="AI Assistant">
              <p>Conversations with the DortX AI assistant may be processed using trusted AI providers solely to generate responses, support users, and improve service quality. Please avoid sharing sensitive personal, financial, legal, medical, or confidential business information unless it is necessary for the enquiry.</p>
            </Section>

            <Section id="cookies" title="Cookies">
              <p>Cookies and similar technologies may be used for analytics, remembering preferences, improving website performance, and supporting security. Users can manage cookie preferences through their browser settings.</p>
            </Section>

            <Section id="data-security" title="Data Security">
              <p>DortX follows industry-standard practices to protect customer information. Where applicable, we use encryption, secure infrastructure, controlled access, and secure cloud hosting practices to reduce risk and protect business data.</p>
            </Section>

            <Section id="third-party-services" title="Third-Party Services">
              <p>Trusted third-party providers may process limited data on our behalf, including cloud hosting, analytics, email providers, AI providers, and payment providers if applicable. Each provider follows its own privacy policy and security practices.</p>
            </Section>

            <Section id="data-retention" title="Data Retention">
              <p>We retain information only as long as necessary for legitimate business purposes, service delivery, customer support, record keeping, legal obligations, dispute resolution, or security requirements.</p>
            </Section>

            <Section id="user-rights" title="User Rights">
              <p>Users may request access to their information, correction, deletion, or withdrawal of consent where applicable. To make a request, contact us at <a href="mailto:support@dortxtech.com" className="text-[#4D8BFF] hover:text-white">support@dortxtech.com</a>.</p>
            </Section>

            <Section id="childrens-privacy" title="Children's Privacy">
              <p>DortX services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
            </Section>

            <Section id="international-users" title="International Users">
              <p>By using this website, international users understand that information may be processed in accordance with applicable laws and business requirements related to the services requested.</p>
            </Section>

            <Section id="changes" title="Changes to Privacy Policy">
              <p>DortX may update this Privacy Policy at any time to reflect changes in services, technology, legal requirements, or business practices. The updated date will be revised when material changes are made.</p>
              <p className="text-[#9AA3B8]">Last Updated: July 2026</p>
            </Section>

            <Section id="contact" title="Contact">
              <p>For privacy questions or requests, contact DortX Technologies:</p>
              <div className="space-y-2">
                <p><a href="mailto:support@dortxtech.com" className="text-[#4D8BFF] hover:text-white">support@dortxtech.com</a></p>
                <p><a href="mailto:thrisha@dortxtech.com" className="text-[#4D8BFF] hover:text-white">thrisha@dortxtech.com</a></p>
                <p><a href="tel:+918150990329" className="text-[#4D8BFF] hover:text-white">+91 81509 90329</a></p>
              </div>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}
