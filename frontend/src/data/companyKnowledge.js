import { CONTACT, FAQS, INDUSTRIES, MISSION, PROCESS_STEPS, TEAM, TECH_GROUPS, VALUES, VISION, WINGS } from "./site";

const OFFICIAL_LAUNCH_ANSWER =
  "DortX Technologies officially launched on 7 July 2026. The company was founded with the vision of helping businesses solve real-world challenges through high-quality software development, automation, AI-driven solutions, IoT, and digital transformation.";

const normalize = (value) => String(value || "").toLowerCase();

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

const list = (items) => items.filter(Boolean).join(", ");

const leadershipBy = (predicate) => TEAM.find(predicate);

const founder = leadershipBy((member) => /founder/i.test(member.role)) || TEAM[0];
const cpo = leadershipBy((member) => /chief product officer|cpo/i.test(member.role));
const cto = leadershipBy((member) => /chief technology officer|cto/i.test(member.role));

const serviceAliases = [
  { terms: ["website", "websites", "web app", "web application", "landing page"], wing: "Software Development", service: "Websites & Web Applications" },
  { terms: ["mobile app", "android", "ios", "mobile"], wing: "Software Development", service: "Mobile Application Development" },
  { terms: ["custom software", "software", "saas", "portal", "dashboard"], wing: "Software Development", service: "Custom software and enterprise products" },
  { terms: ["erp", "crm", "hrms", "inventory", "payroll"], wing: "Software Development", service: "Custom ERP, CRM and HRMS" },
  { terms: ["ui/ux", "ui ux", "design", "prototype", "figma"], wing: "Software Development", service: "UI/UX Design" },
  { terms: ["ai", "agent", "chatbot", "llm", "automation", "workflow"], wing: "Cognitive Automation & AI", service: "AI chatbots, agents and workflow automation" },
  { terms: ["data", "analytics", "bi", "dashboard", "reporting", "prediction"], wing: "Data Intelligence", service: "Data analytics, BI dashboards and predictive analytics" },
  { terms: ["iot", "iiot", "embedded", "robot", "robotics", "plc", "scada", "hmi", "sensor", "pcb"], wing: "IoT & Industrial Automation", service: "IoT, embedded systems, robotics and industrial automation" },
  { terms: ["cloud", "devops", "aws", "azure", "security", "cyber", "maintenance", "support"], wing: "Continuity & Security", service: "Cloud, DevOps, cybersecurity, maintenance and support" },
  { terms: ["marketing", "seo", "digital marketing", "growth", "brand"], wing: "Strategic Growth", service: "SEO, digital marketing, brand and growth systems" },
];

export const COMPANY_KNOWLEDGE = {
  name: "DortX Technologies",
  launchDate: "7 July 2026",
  startedAnswer: OFFICIAL_LAUNCH_ANSWER,
  founder: founder?.name || "Thrisha J C",
  ceo: founder?.name || "Thrisha J C",
  foundingEngineer: founder?.name || "Thrisha J C",
  location: "DortX works remotely with businesses across India and globally. For direct enquiries, contact the team through the website or support@dortxtech.com.",
  mission: MISSION,
  vision: VISION,
  story:
    "DortX was started to be the kind of technology partner businesses often wish existed: a focused team that begins with the business problem, then chooses the right software, AI, IoT or automation approach to solve it reliably.",
  difference:
    "DortX is different because the team stays small, quality-focused and transparent. We do not treat technology as a template. We start with the business problem, design carefully, build maintainable systems, communicate clearly and aim for long-term partnerships instead of one-off delivery.",
  contact: CONTACT,
  values: VALUES,
  wings: WINGS,
  team: TEAM,
  faqs: FAQS,
  technologies: TECH_GROUPS,
  process: PROCESS_STEPS,
  industries: INDUSTRIES,
};

const teamSummary = () => TEAM.map((member) => `- **${member.name}**: ${member.role}`).join("\n");

const servicesSummary = () => WINGS.map((wing) => {
  const services = wing.services.map((service) => service.title).join(", ");
  return `- **${wing.name}**: ${wing.short} Includes ${services}.`;
}).join("\n");

const technologiesSummary = () => TECH_GROUPS.map((group) => `- **${group.group}**: ${group.items.join(", ")}`).join("\n");

const processSummary = () => PROCESS_STEPS.map((step) => `${step.num}. ${step.title}`).join("\n");

const industriesSummary = () => list(INDUSTRIES.map((industry) => industry.name));

const faqReply = (text) => {
  const match = FAQS.find((faq) => {
    const question = normalize(faq.q);
    return question.split(/\W+/).filter((word) => word.length > 3).some((word) => text.includes(word));
  });
  return match ? match.a : "";
};

const serviceRecommendation = (text) => {
  const match = serviceAliases.find(({ terms }) => includesAny(text, terms));
  if (!match) return "";
  const wing = WINGS.find((item) => item.name === match.wing);
  return `For that need, I would usually recommend DortX's **${match.wing}** wing, especially **${match.service}**.\n\n${wing?.description || ""}\n\nIf you want, I can also help turn this into a project brief or connect you with the team for a consultation.`;
};

const wingReply = (text) => {
  const wing = WINGS.find((item) => {
    const haystack = normalize(`${item.name} ${item.id} ${item.services.map((service) => service.title).join(" ")}`);
    return haystack.split(/\W+/).filter((word) => word.length > 3).some((word) => text.includes(word));
  });
  if (!wing) return "";
  return `**${wing.name}** is one of DortX's core service wings. ${wing.description}\n\nKey services include:\n${wing.services.map((service) => `- **${service.title}**: ${service.desc}`).join("\n")}`;
};

export function getCompanyAssistantReply(message) {
  const text = normalize(message);

  if (!text.trim()) return "";

  const asksLaunchDate =
    includesAny(text, ["when was dortx started", "when did dortx start", "when was dortx launched", "when did dortx launch", "officially launch", "official launch", "start date", "launch date"]) ||
    (includesAny(text, ["when", "date"]) && includesAny(text, ["started", "launched", "launch"]));
  if (asksLaunchDate) {
    return OFFICIAL_LAUNCH_ANSWER;
  }

  if (includesAny(text, ["what is dortx", "about dortx", "what does dortx do", "who are you"])) {
    return `DortX Technologies is a technology company focused on high-quality software development, AI solutions, automation, IoT systems and digital transformation. We help businesses turn real operational problems into reliable products, workflows and connected systems.`;
  }

  if (includesAny(text, ["founder", "founded", "who started"])) {
    return `DortX Technologies was founded by **${COMPANY_KNOWLEDGE.founder}**, who serves as the **Founder & CEO**. As the **Founding Engineer**, she also leads the company's product vision, software architecture and engineering direction.`;
  }

  if (includesAny(text, ["ceo", "chief executive"])) {
    return `The CEO of DortX Technologies is **${COMPANY_KNOWLEDGE.ceo}**. She is also the Founder and Founding Engineer, leading the company's product vision, software architecture and engineering direction.`;
  }

  if (includesAny(text, ["founding engineer"])) {
    return `The Founding Engineer of DortX Technologies is **${COMPANY_KNOWLEDGE.foundingEngineer}**. She leads the company's technical direction, software architecture and engineering standards.`;
  }

  if (includesAny(text, ["chief product officer", "cpo", "creative head"])) {
    return cpo ? `DortX's Chief Product Officer / Creative Head is **${cpo.name}**. ${cpo.bio}` : "DortX's product and creative leadership details are managed from the Team page.";
  }

  if (includesAny(text, ["cto", "chief technology officer"])) {
    return cto ? `DortX's CTO is **${cto.name}**. ${cto.bio}` : "DortX's technology leadership details are managed from the Team page.";
  }

  if (includesAny(text, ["team", "members", "leadership", "who works", "people"])) {
    return `Here is the current DortX team from the Team page:\n\n${teamSummary()}`;
  }

  if (includesAny(text, ["mission"])) return COMPANY_KNOWLEDGE.mission;
  if (includesAny(text, ["vision"])) return COMPANY_KNOWLEDGE.vision;
  if (includesAny(text, ["why was dortx started", "why did you start", "company story", "story"])) return COMPANY_KNOWLEDGE.story;
  if (includesAny(text, ["what makes dortx different", "different", "why choose dortx", "why dortx"])) return COMPANY_KNOWLEDGE.difference;
  if (includesAny(text, ["where is dortx", "location", "located", "office", "address"])) return COMPANY_KNOWLEDGE.location;

  if (includesAny(text, ["contact", "email", "phone", "call", "whatsapp"])) {
    return `You can contact DortX at **${CONTACT.support}** or **${CONTACT.phone}**. You can also reach the founder at **${CONTACT.founder}**.`;
  }

  if (includesAny(text, ["pricing", "budget", "cost"])) {
    return "DortX pricing depends on the scope, complexity, integrations, timeline and level of ongoing support needed. The team shares a transparent estimate after understanding the requirement, so there are no hidden fees or vague assumptions. If you want a formal quotation, I can collect the project details and connect you with the team.";
  }

  if (includesAny(text, ["services", "what services", "wings", "offer", "provide"])) {
    return `DortX works through six service wings:\n\n${servicesSummary()}`;
  }

  const recommendation = serviceRecommendation(text);
  if (recommendation) return recommendation;

  const wing = wingReply(text);
  if (wing) return wing;

  if (includesAny(text, ["technology", "tech stack", "tools", "stack"])) {
    return `DortX uses a practical modern technology stack:\n\n${technologiesSummary()}`;
  }

  if (includesAny(text, ["industries", "industry", "sectors", "serve", "clients"])) {
    return `DortX can work across industries where software, automation, AI, data or connected systems can improve operations. Key sectors include ${industriesSummary()}.`;
  }

  if (includesAny(text, ["process", "how do you work", "project steps", "engagement"])) {
    return `DortX follows a clear delivery process:\n\n${processSummary()}\n\nThe goal is transparent scope, steady delivery, careful testing and reliable post-launch support.`;
  }

  if (includesAny(text, ["career", "job", "hiring", "internship", "work at dortx"])) {
    return "DortX grows carefully and looks for people who care about quality, learning and real business outcomes. You can check the Careers page or contact the team if you want to work with DortX.";
  }

  if (includesAny(text, ["privacy", "data policy", "personal information"])) {
    return "DortX respects user privacy and uses information from forms and the AI assistant only to understand enquiries, communicate clearly, provide services and improve support. DortX does not sell personal information.";
  }

  if (includesAny(text, ["terms", "conditions", "ip", "ownership"])) {
    return "DortX finalizes project scope, pricing, timelines and deliverables through written agreements, proposals or statements of work. Once invoices are settled, source code, designs and project assets belong to the client unless otherwise agreed.";
  }

  const faq = faqReply(text);
  if (faq) return faq;

  if (includesAny(text, ["hello", "hi", "hey"])) {
    return "Hi! I'm the DortX AI Assistant. You can ask me about DortX, our team, services, technologies, process, pricing approach, careers or contact details.";
  }

  return "";
}
