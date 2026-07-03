export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/technologies", label: "Technologies" },
  { to: "/process", label: "Process" },
  { to: "/team", label: "Team" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
];

export const WINGS = [
  {
    id: "software",
    number: "01",
    name: "Software Development",
    short: "Web, mobile and enterprise products built with care.",
    description:
      "We design, build and ship reliable software end-to-end - with clean architecture, maintainable code, thorough testing and delivery milestones your team can trust.",
    services: [
      { title: "Websites & Web Applications", desc: "Modern React, Next.js and full-stack platforms built for performance, reliability and long-term maintainability." },
      { title: "Mobile Application Development", desc: "Cross-platform iOS & Android apps with thoughtful UX, reliable architecture and careful testing." },
      { title: "UI/UX Design", desc: "Research-driven product design - wireframes, prototypes and design systems that reduce rework." },
      { title: "Custom ERP, CRM, HRMS", desc: "Bespoke internal platforms designed around how your business works, with scalable workflows and clean code." },
      { title: "Cloud & DevOps Engineering", desc: "AWS, GCP and Azure setups with CI/CD, observability and release practices built for dependable delivery." },
    ],
    icon: "Code2",
  },
  {
    id: "ai",
    number: "02",
    name: "Cognitive Automation & AI",
    short: "AI agents, automations and intelligent products.",
    description:
      "We build production-ready AI systems that create business value - automating workflows, improving decisions and staying reliable beyond the demo.",
    services: [
      { title: "AI Chatbots & Agents", desc: "Domain-trained assistants that handle support, sales and internal operations with tested, maintainable workflows." },
      { title: "Workflow Automation", desc: "End-to-end automations across your tools - observable, testable, maintainable and built to save real time." },
      { title: "Custom AI Applications", desc: "Products powered by leading LLMs, tailored to your data, and engineered for reliable production use." },
      { title: "AI Integration Services", desc: "Plug intelligence into your existing CRM, ERP and SaaS stack with clear integration plans and support." },
    ],
    icon: "Brain",
  },
  {
    id: "data",
    number: "03",
    name: "Data Intelligence",
    short: "Turn raw data into clear, useful decisions.",
    description:
      "We build the data foundations, pipelines and dashboards modern teams need to move from gut-feel to evidence-led decisions.",
    services: [
      { title: "Business Intelligence & Dashboards", desc: "Fast, clear dashboards in Power BI, Tableau, Metabase or a custom build." },
      { title: "Data Analytics", desc: "Cohort, funnel, retention and product analytics that answer the right questions." },
      { title: "Predictive Analytics", desc: "Forecasting, churn, demand and risk models built on your historical data." },
      { title: "Reporting & Visualization", desc: "Automated reports that ship to inboxes and Slack on the right schedule." },
    ],
    icon: "BarChart3",
  },
  {
    id: "growth",
    number: "04",
    name: "Strategic Growth",
    short: "Growth treated as a system, not a one-off campaign.",
    description:
      "SEO, paid media, analytics and brand work together as one practice — designed to compound your pipeline month after month.",
    services: [
      { title: "Search Engine Optimization", desc: "Technical, on-page and content SEO focused on long-term organic growth." },
      { title: "Performance Marketing", desc: "Paid acquisition across Google, Meta and LinkedIn — optimised on outcomes." },
      { title: "Growth Analytics", desc: "Attribution, LTV/CAC and experimentation frameworks for revenue teams." },
      { title: "Brand Transformation", desc: "Positioning, identity and messaging that earn trust." },
    ],
    icon: "TrendingUp",
  },
  {
    id: "iot",
    number: "05",
    name: "IoT & Industrial Automation",
    short: "Connected machines, smart factories and embedded systems.",
    description:
      "We design and build intelligent IoT and industrial automation solutions that connect devices, machines, and business systems to improve efficiency, reduce downtime, and accelerate digital transformation.",
    services: [
      { title: "Industrial IoT (IIoT) Solutions", desc: "Connect machines, sensors and industrial equipment to intelligent platforms for real-time monitoring, predictive insights, remote management and operational efficiency." },
      { title: "Industrial Automation", desc: "Design and implement PLC, SCADA, HMI, process automation and production line automation systems that reduce manual effort and improve manufacturing efficiency." },
      { title: "Embedded Systems Development", desc: "Develop reliable embedded hardware and firmware for custom IoT devices, intelligent controllers and connected products using Arduino, ESP32, STM32 and Raspberry Pi." },
      { title: "Smart Devices & Robotics", desc: "Build intelligent robotic systems and smart connected devices with robotics integration, autonomous systems, machine vision, AI-powered robotics and real-time control." },
      { title: "Custom Hardware & PCB Solutions", desc: "Design custom electronics, PCB prototypes, embedded electronics and hardware integrations for scalable industrial, commercial and IoT products." },
    ],
    icon: "Factory",
  },
  {
    id: "security",
    number: "06",
    name: "Continuity & Security",
    short: "Keep your systems fast, safe and always available.",
    description:
      "We protect, monitor and continuously improve the systems you depend on - so your software stays reliable while your business keeps moving.",
    services: [
      { title: "Application Maintenance", desc: "Long-term support, bug fixes, performance improvements and steady feature delivery on existing platforms." },
      { title: "Cybersecurity", desc: "Audits, hardening and ongoing threat monitoring." },
      { title: "Technical Support", desc: "Reliable support across web, mobile and cloud infrastructure." },
      { title: "Performance Optimization", desc: "Frontend, backend and database tuning for real-world speed wins." },
    ],
    icon: "ShieldCheck",
  },
];

export const PROCESS_STEPS = [
  { num: "01", title: "Requirement Analysis", desc: "We listen, ask the hard questions and turn ambiguity into a crisp written brief.", icon: "ClipboardList" },
  { num: "02", title: "Planning", desc: "Scope, milestones, risks and architecture agreed upfront so delivery stays clear and predictable.", icon: "Map" },
  { num: "03", title: "UI/UX Design", desc: "Wireframes and high-fidelity designs reviewed in tight feedback loops to reduce rework.", icon: "PenTool" },
  { num: "04", title: "Development", desc: "Sprint-based delivery with clean, maintainable code, weekly demos and transparent progress.", icon: "Code2" },
  { num: "05", title: "Testing", desc: "Thorough QA across devices, browsers, integrations and edge cases before release.", icon: "TestTube2" },
  { num: "06", title: "Deployment", desc: "Smooth releases with monitoring, alerts, rollback safety and on-time launch discipline.", icon: "Rocket" },
  { num: "07", title: "Maintenance", desc: "Ongoing improvements, security patches and reliability work.", icon: "Wrench" },
];

export const INDUSTRIES = [
  { name: "Healthcare",                icon: "Stethoscope" },
  { name: "Hospitals",                 icon: "Cross" },
  { name: "Retail",                    icon: "Store" },
  { name: "E-Commerce",                icon: "ShoppingBag" },
  { name: "Restaurants & Hospitality", icon: "UtensilsCrossed" },
  { name: "Manufacturing",             icon: "Factory" },
  { name: "Real Estate",               icon: "Home" },
  { name: "Construction",              icon: "HardHat" },
  { name: "Education",                 icon: "GraduationCap" },
  { name: "Finance",                   icon: "Banknote" },
  { name: "Banking",                   icon: "Landmark" },
  { name: "Insurance",                 icon: "ShieldCheck" },
  { name: "Travel & Tourism",          icon: "Plane" },
  { name: "Transportation",            icon: "Bus" },
  { name: "Logistics & Supply Chain",  icon: "Package" },
  { name: "Professional Services",     icon: "Briefcase" },
  { name: "Legal Firms",               icon: "Scale" },
  { name: "Human Resources",           icon: "Users" },
  { name: "Startups",                  icon: "Rocket" },
  { name: "Small & Medium Businesses", icon: "Building" },
  { name: "Enterprises",               icon: "Building2" },
  { name: "Government",                icon: "Castle" },
  { name: "Non-Profit Organizations",  icon: "HeartHandshake" },
  { name: "Media & Entertainment",     icon: "Film" },
  { name: "Telecommunications",        icon: "RadioTower" },
  { name: "Automotive",                icon: "Car" },
  { name: "Energy & Utilities",        icon: "Zap" },
  { name: "Pharmaceuticals",           icon: "Pill" },
  { name: "Warehousing",               icon: "Warehouse" },
];

export const TECH_GROUPS = [
  { group: "Frontend",       items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Shadcn UI"] },
  { group: "Backend",        items: ["Java", "Spring Boot", "Spring Security"] },
  { group: "AI",             items: ["Python", "OpenAI", "Gemini", "Claude", "LangChain"] },
  { group: "Database",       items: ["MySQL", "PostgreSQL", "Redis"] },
  { group: "Cloud & DevOps", items: ["Docker", "AWS", "Azure", "GitHub Actions"] },
  { group: "IoT & Industrial", items: ["Arduino", "ESP32", "STM32", "Raspberry Pi", "PLC", "SCADA", "HMI", "MQTT", "Modbus", "OPC UA", "Industrial Sensors", "Edge Computing"] },
  { group: "Testing",        items: ["Playwright", "JUnit", "Postman"] },
  { group: "Design",         items: ["Figma"] },
];

/* ---------------------------------------------------------------------------
   TEAM
   - Every name, role, bio, photo and "responsibilities" entry is editable.
   - To swap the initials avatar for a real photo, set `photo` to a URL
     (preferably square / 1:1, min 600×600 for crispness).
   - No fake experience claims, no certifications, no metrics.
   --------------------------------------------------------------------------- */
export const TEAM = [
  {
    name: "Thrisha J C",
    role: "Founder & CEO | Founding Engineer",
    leadership: true,
    photo: "/team-members/thrisha.jpeg",
    bio: "Founded DortX with a conviction that small, focused teams can deliver software that actually changes how a business runs. Sets the company's vision and stays close to every line of architecture.",
    expertise: "Engineering Leadership | Product Strategy | System Architecture",
    responsibilities: ["Company vision", "Technical architecture", "Software engineering", "Product strategy"],
    linkedin: "https://www.linkedin.com/in/thrishajc05",
    email_address: "thrisha@dortxtech.com",
  },
  {
    name: "Venu P K",
    role: "Co-Founder | Chief Marketing Officer",
    photo: "/team-members/venu-pk.jpeg",
    bio: "Owns brand, growth and go-to-market at DortX - making sure the businesses we can help the most actually find us, understand us and choose to work with us.",
    expertise: "Brand & Growth Marketing",
    responsibilities: ["Digital growth", "Marketing strategy", "SEO", "Performance marketing", "Brand development"],
    linkedin: "https://www.linkedin.com/in/venupk",
  },
  {
    name: "Mallikarjun",
    role: "Chief Technology Officer (CTO) | AI & Autonomous Systems Engineer",
    photo: "/team-members/mallikaarjun.jpeg",
    bio: "Designs and ships AI agents, automation workflows and machine-learning systems that move from notebooks into real production environments - measured by outcomes, not demos.",
    expertise: "AI Engineering | Agentic Systems",
    responsibilities: ["AI solutions", "AI agents", "Automation", "Machine learning"],
    linkedin: "https://www.linkedin.com/in/mallikarjun25",
  },
  {
    name: "Lalith S",
    role: "Chief Product Officer (CPO) | Data Engineer & Automation Architect",
    photo: "/team-members/lalith-s.jpeg",
    bio: "Designs the data pipelines, warehouses and automation flows that turn scattered information into clear, dependable signals for the business.",
    expertise: "Data Engineering | BI | Workflow Automation",
    responsibilities: ["Data engineering", "Analytics", "Business intelligence", "Workflow automation"],
    linkedin: "https://www.linkedin.com/in/lalithanju",
  },
   {
    name: "Kavyashree",
    role: "Full Stack Developer",
    photo: "/team-members/kavyashree.jpeg",
    bio: "Builds end-to-end web and mobile experiences - from clean, accessible interfaces to dependable APIs. Cares deeply about details that users never notice and developers always do.",
    expertise: "Web & Mobile Development",
    responsibilities: ["Frontend development", "Backend development", "API integration", "Application development"],
    linkedin: "https://www.linkedin.com/in/kavyashree2005",
  },
   {
    name: "Chandana",
    role: "Creative Head",
    photo: "/team-members/chandana.jpeg",
    bio: "Shapes the visual and experiential identity of DortX - translating product strategy into interfaces, brand systems and design language people connect with.",
    expertise: "Product Design | Brand Identity",
    responsibilities: ["UI/UX design", "Brand identity", "Visual design", "Creative direction"],
    linkedin: "https://www.linkedin.com/in/chandana-39379636b/",
  },
  {
    name: "Anusha R",
    role: "Software Developer",
    photo: "/team-members/anusha-r.jpeg",
    bio: "Works across application features, quality and testing - focused on shipping software that's not just functional, but genuinely pleasant for the people using it.",
    expertise: "Application Development | Quality",
    responsibilities: ["Software development", "Application features", "Quality improvements", "Testing support"],
    linkedin: "https://www.linkedin.com/in/anusha-r-a82307260",
  },

];
/* ---------------------------------------------------------------------------
   VALUES
   --------------------------------------------------------------------------- */
export const VALUES = [
  { t: "Innovation", d: "Curiosity over comfort. We try new approaches, learn fast and bring the best of them into our work." },
  { t: "Integrity", d: "We do what we say. Honest scoping, honest progress updates and honest reviews - even when it's the harder conversation." },
  { t: "Customer Success", d: "Your outcome is the measure of our work. If your business wins, we win." },
  { t: "Quality Engineering", d: "Code worth reading. Architectures worth scaling. Reviews worth doing. Quality is built into every phase." },
  { t: "Transparency", d: "Open roadmaps, open code, open conversations. No hidden hours, no surprise invoices." },
  { t: "Continuous Learning", d: "Technology changes weekly. So do we. We invest in ourselves so you don't pay for our learning curve." },
  { t: "Collaboration", d: "We work with you, not for you. The best products come from teams that share decisions, not handoffs." },
  { t: "Reliability", d: "Calm delivery. Predictable timelines. Software you can trust at 3am as easily as 3pm." },
];

/* ---------------------------------------------------------------------------
   FAQ — all "senior" / "decades" claims removed
   --------------------------------------------------------------------------- */
export const FAQS = [
  { q: "Why choose DortX?", a: "We combine engineering, design and AI capability under one small team - with quality-first development, transparent communication and a strong focus on solving the business problem." },
  { q: "How long does a typical project take?", a: "It depends on scope. An MVP usually takes 6-10 weeks; larger platforms can run 3-9 months. We share a clear timeline after requirement analysis and work to deliver on schedule." },
  { q: "Do you build AI solutions?", a: "Yes. We design and ship AI agents, chatbots, document automations and intelligent applications using leading LLMs and open-source models, with testing and production reliability in mind." },
  { q: "Do you build IoT and industrial automation solutions?", a: "Yes. We build IIoT systems, machine monitoring, predictive maintenance workflows, PLC/SCADA/HMI solutions, embedded systems, smart devices, robotics integrations and custom PCB prototypes." },
  { q: "Do you provide support after launch?", a: "Yes. We offer ongoing maintenance plans covering bug fixes, security, performance, reliability and feature work." },
  { q: "Can you modernize our existing software?", a: "Yes. We audit legacy systems and re-platform them step by step without freezing your business, improving maintainability and long-term reliability along the way." },
  { q: "Do you sign NDAs?", a: "Yes. We sign mutual NDAs before sharing any sensitive details. Discretion and trust are non-negotiable for us." },
  { q: "How much does a project cost?", a: "Pricing depends on scope, complexity and timeline. We share a transparent estimate after a short discovery call. No hidden fees, no surprises." },
  { q: "Do you build MVPs?", a: "Yes. MVPs are one of our favourite engagements - small, fast, well-architected products that can grow into something larger without sacrificing quality." },
  { q: "Do you work with international clients?", a: "Yes. We work remotely with founders and teams across India and globally." },
  { q: "Can you maintain applications built by another team?", a: "Yes. We regularly take over and stabilise codebases — starting with a technical audit and a clear handover plan." },
  { q: "What does the engagement look like?", a: "You get a dedicated point-of-contact and a small focused team, weekly demos, async updates, transparent progress tracking and clear delivery checkpoints." },
  { q: "What technologies do you specialize in?", a: "React, Next.js, TypeScript, Python, Java Spring Boot, FastAPI, MongoDB, MySQL, PostgreSQL, AWS/GCP/Azure, modern AI stacks, Arduino, ESP32, STM32, Raspberry Pi, PLC, SCADA, MQTT, Modbus and OPC UA." },
  { q: "Do you offer fixed-price projects?", a: "For well-defined scopes — yes. For evolving products, we recommend time-and-materials with clear milestones and weekly accountability." },
  { q: "Who owns the IP and the code?", a: "You do. Once invoices are settled, all source code, designs and assets belong fully to your company." },
  { q: "How do we start working together?", a: "Send us a note via the Contact page. We'll reply quickly and set up a short discovery call." },
];

export const MISSION = "To empower businesses through intelligent technology - building reliable software, AI systems, IoT platforms and automation tools that turn ambitious ideas into real outcomes.";

export const VISION = "To become the technology partner businesses trust to build the next decade of intelligent products - known for quality-first engineering, dependable delivery and long-term relationships.";

export const FOOTER_LINKS = [
  { to: "/careers", label: "Careers" },
  { to: "/faq", label: "FAQ" },
];

export const CONTACT = {
  support: "support@dortxtech.com",
  founder: "thrisha@dortxtech.com",
  phone: "+91 81509 90329",
  phoneHref: "tel:+918150990329",
  linkedin: "https://www.linkedin.com/company/dortxtech.com/",
};

export const SOCIALS = [
  { name: "LinkedIn",  url: CONTACT.linkedin, icon: "Linkedin"  },
];
