import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Logo from "./Logo";
import { API_URL, apiClient } from "@/config/api";

const SERVICE_OPTIONS = [
  "AI Agents",
  "Business Automation",
  "Custom Software",
  "Website Development",
  "Mobile Apps",
  "AI Chatbots",
  "Workflow Automation",
  "Data & Analytics",
  "Cloud Solutions",
  "IoT & Industrial Automation",
  "Embedded Systems",
  "Industrial Automation",
  "UI/UX Design",
  "Not sure yet",
];

const QUICK_ACTIONS = [
  "Build an AI Agent",
  "Create a Website",
  "Need Automation",
  "Book Consultation",
  "Talk to Sales",
  "View Portfolio",
  "Our Technologies",
  "IoT Automation",
  "Pricing",
  "Contact Us",
];

const LEAD_FIELDS = [
  { key: "preferred_contact_method", label: "Contact preference", required: true, question: "How would you prefer DortX to contact you: email, phone, or WhatsApp?" },
  { key: "phone", label: "Phone number", required: true, question: "Great. Please enter your phone number." },
  { key: "name", label: "Name", required: true, question: "Thank you. What name should the DortX team use when contacting you?" },
  { key: "email", label: "Email", required: true, question: "Please share a valid email address so DortX can create your request record." },
  { key: "company", label: "Company", required: false, question: "Which company are you representing? You can type 'skip' if this is personal." },
  { key: "project_type", label: "Project type", required: false, question: "What type of project is this? You can type 'skip' if you are not sure yet." },
  { key: "requirements", label: "Project details", required: true, question: "Briefly describe your project or requirement." },
  { key: "budget", label: "Budget", required: false, question: "Do you have a budget range in mind? You can type 'skip' if not sure yet." },
  { key: "timeline", label: "Timeline", required: false, question: "What timeline are you hoping for? You can type 'skip' if flexible." },
];

const initialAssistantMessage = {
  id: "initial-assistant",
  role: "assistant",
  content:
    "Hi! Welcome to DortX!\n\nI'm the DortX AI Assistant.\n\nBefore we begin, I'd love to know a little about you.\n\n**What is your name?**",
  createdAt: new Date().toISOString(),
  status: "received",
};

const freshInitialAssistantMessage = () => ({
  ...initialAssistantMessage,
  id: `initial-assistant-${Date.now()}`,
  createdAt: new Date().toISOString(),
});

const makeMessage = (role, content, extra = {}) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
  createdAt: new Date().toISOString(),
  status: role === "user" ? "sent" : "received",
  ...extra,
});

const normalizeMessages = (items) => (Array.isArray(items) && items.length ? items : [freshInitialAssistantMessage()]).map((message, index) => ({
  ...message,
  id: message.id || `${message.role || "message"}-${index}-${Date.now()}`,
  createdAt: message.createdAt || new Date().toISOString(),
  status: message.status || (message.role === "user" ? "sent" : "received"),
}));

const formatTime = (value) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const dateKey = (value) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  return date.toDateString();
};

const dateLabel = (value) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "Today";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" });
};

const statusLabel = (message) => {
  if (message.role === "user") {
    if (message.status === "sending") return "Sending...";
    if (message.status === "error") return "Error";
    return "Sent";
  }
  if (message.status === "error") return "Error";
  if (message.streaming) return message.content ? "Receiving..." : "AI is typing...";
  return "Received";
};

const sid = () => {
  let session = localStorage.getItem("dortx-chat-sid");
  if (!session) {
    session = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("dortx-chat-sid", session);
  }
  return session;
};

const loadJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const isBuyingIntent = (text) => {
  const value = text.toLowerCase();
  return [
    "book", "book consultation", "consultation", "talk to sales", "hire",
    "start project", "build for me", "contact me", "call me", "whatsapp me",
    "send proposal", "schedule", "connect me",
  ].some((token) => value.includes(token));
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const normalizeContactMethod = (value) => {
  const text = String(value || "").trim().toLowerCase();
  if (text.includes("whatsapp") || text.includes("whats app")) return "WhatsApp";
  if (text.includes("phone") || text.includes("call")) return "Phone";
  if (text.includes("email") || text.includes("mail")) return "Email";
  return "";
};

function isValidPhone(input, defaultCountry = "IN") {
  const phoneNumber = parsePhoneNumberFromString(input, defaultCountry);
  return phoneNumber ? phoneNumber.isValid() : false;
}

const isPhone = (value) => {
  return isValidPhone(value, "IN");
};

const contactRequiresPhone = (lead = {}) => ["Phone", "WhatsApp"].includes(lead.preferred_contact_method);

const SERVICE_MEMORY_PATTERNS = [
  { service: "Website Development", pattern: /\b(website|web site|landing page|redesign|cms)\b/i },
  { service: "Web Application", pattern: /\b(web app|web application|portal|dashboard app)\b/i },
  { service: "Mobile App", pattern: /\b(mobile app|android|ios)\b/i },
  { service: "ERP", pattern: /\b(erp|inventory|operations system)\b/i },
  { service: "CRM", pattern: /\b(crm|lead management|sales pipeline)\b/i },
  { service: "HRMS", pattern: /\b(hrms|payroll|attendance|employee management)\b/i },
  { service: "SaaS", pattern: /\b(saas|subscription software)\b/i },
  { service: "AI Chatbot", pattern: /\b(chatbot|chat bot|support bot)\b/i },
  { service: "AI Agent", pattern: /\b(ai agent|agent|mcp|tool calling)\b/i },
  { service: "AI Automation", pattern: /\b(ai automation|workflow automation|rag|llm|openai|claude|gemini)\b/i },
  { service: "Data & Analytics", pattern: /\b(analytics|dashboard|reporting|bi|business intelligence|prediction)\b/i },
  { service: "Marketing", pattern: /\b(seo|branding|marketing|growth|performance marketing)\b/i },
  { service: "IoT & Industrial Automation", pattern: /\b(iot|iiot|plc|scada|hmi|esp32|arduino|raspberry|robot|sensor)\b/i },
  { service: "Security / DevOps", pattern: /\b(security|cyber|devops|cloud|monitoring|maintenance)\b/i },
];

const deriveMemoryPatch = (text, current = {}) => {
  const value = String(text || "");
  const patch = {};
  const serviceMatch = SERVICE_MEMORY_PATTERNS.find(({ pattern }) => pattern.test(value));
  if (serviceMatch) patch.service = serviceMatch.service;

  const email = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  if (email) patch.email = email;

  const phone = value.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0];
  if (phone) patch.phone = phone.trim();

  const budget = value.match(/\b(?:budget|cost|price|around|under|within)\s*(?:is|of|:)?\s*((?:INR|Rs\.?|USD|EUR|GBP|\$)?\s?[\w., -]{2,40})/i)?.[1];
  if (budget) patch.budget = budget.trim();

  const timeline = value.match(/\b(?:timeline|deadline|launch|deliver|within|in)\s*(?:is|by|:)?\s*([A-Za-z0-9 ,.-]{2,40})/i)?.[1];
  if (timeline) patch.timeline = timeline.trim();

  const businessType = value.match(/\b(?:for my|for our|we run|i run|business is|company is)\s+([A-Za-z0-9 &-]{2,60})/i)?.[1];
  if (businessType) patch.business_type = businessType.trim();

  if (value.length > 25 && looksLikeConsultingRequest(value)) {
    patch.requirements = [current.requirements, value].filter(Boolean).slice(-2).join("\n");
  }

  return patch;
};

const looksLikeConsultingRequest = (text) => {
  const value = text.toLowerCase();
  return /[?]/.test(value) || [
    "need", "want", "build", "create", "develop", "website", "app", "software",
    "automation", "ai", "agent", "chatbot", "erp", "crm", "hrms", "iot",
    "robot", "embedded", "seo", "pricing", "cost", "timeline", "service",
  ].some((token) => value.includes(token));
};

function MarkdownMessage({ content }) {
  const lines = String(content || "").split("\n");
  const nodes = [];
  let list = [];
  let table = [];
  let code = [];
  let inCode = false;

  const flushList = () => {
    if (!list.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="my-2 ml-4 list-disc space-y-1">
        {list.map((item, index) => <li key={index}>{formatInline(item)}</li>)}
      </ul>
    );
    list = [];
  };

  const flushTable = () => {
    if (table.length < 2) {
      table = [];
      return;
    }
    const rows = table.filter((row) => !/^\s*\|?\s*-+/.test(row));
    nodes.push(
      <div key={`tbl-${nodes.length}`} className="my-2 overflow-x-auto">
        <table className="min-w-full text-left text-[12px] border-separate border-spacing-y-1">
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.split("|").filter(Boolean).map((cell, cellIndex) => (
                  <td key={cellIndex} className="pr-3 align-top text-[#DDE6F5]">{formatInline(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    table = [];
  };

  const flushCode = () => {
    if (!code.length) return;
    nodes.push(
      <pre key={`code-${nodes.length}`} className="my-2 rounded-xl bg-black/35 border border-white/10 p-3 overflow-x-auto text-[12px] text-[#E7EBF3]">
        <code>{code.join("\n")}</code>
      </pre>
    );
    code = [];
  };

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushList();
        flushTable();
        inCode = true;
      }
      return;
    }
    if (inCode) {
      code.push(line);
      return;
    }
    if (line.includes("|") && line.trim().startsWith("|")) {
      flushList();
      table.push(line);
      return;
    }
    flushTable();
    const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flushList();
    if (!line.trim()) {
      nodes.push(<div key={`br-${nodes.length}`} className="h-2" />);
      return;
    }
    nodes.push(<p key={`p-${nodes.length}`} className="mb-1 last:mb-0">{formatInline(line)}</p>);
  });

  flushCode();
  flushList();
  flushTable();
  return <div className="chat-markdown">{nodes}</div>;
}

function formatInline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  const renderEmailText = (value, keyPrefix, className = "") => (
    String(value).split(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi).map((emailPart, emailIndex) => (
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailPart)
        ? <a key={`${keyPrefix}-${emailIndex}`} href={`mailto:${emailPart}`} className="text-[#9DB8FF] hover:text-white underline underline-offset-2">{emailPart}</a>
        : <span key={`${keyPrefix}-${emailIndex}`} className={className}>{emailPart}</span>
    ))
  );

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="text-white font-semibold">{renderEmailText(part.slice(2, -2), `bold-${index}`)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-white/10 px-1 py-0.5 text-[#DCE8FF]">{part.slice(1, -1)}</code>;
    return <span key={index}>{renderEmailText(part, `text-${index}`)}</span>;
  });
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => normalizeMessages(loadJson("dortx-chat-messages", [freshInitialAssistantMessage()])));
  const [memory, setMemory] = useState(() => loadJson("dortx-chat-memory", { name: "", service: "", lead: {} }));
  const [stage, setStage] = useState(() => localStorage.getItem("dortx-chat-stage") || "name");
  const [leadIndex, setLeadIndex] = useState(() => Number(localStorage.getItem("dortx-chat-lead-index") || 0));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const abortRef = useRef(null);
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const autoScrollRef = useRef(true);

  const recentHistory = useMemo(
    () => messages
      .filter(({ role, content }) => ["user", "assistant"].includes(role) && String(content || "").trim())
      .slice(-10)
      .map(({ role, content }) => ({ role, content })),
    [messages]
  );

  useEffect(() => {
    saveJson("dortx-chat-messages", messages.slice(-40));
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (autoScrollRef.current) {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollHeight;
        setShowNewMessages(false);
      });
    } else if (open) {
      setShowNewMessages(true);
    }
  }, [messages, open, busy]);

  useEffect(() => {
    saveJson("dortx-chat-memory", memory);
  }, [memory]);

  useEffect(() => {
    localStorage.setItem("dortx-chat-stage", stage);
    localStorage.setItem("dortx-chat-lead-index", String(leadIndex));
  }, [stage, leadIndex]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distanceFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const nearBottom = distanceFromBottom < 80;
    autoScrollRef.current = nearBottom;
    if (nearBottom) setShowNewMessages(false);
  };

  const scrollToLatest = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    autoScrollRef.current = true;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
    setShowNewMessages(false);
  };

  const append = (message) => {
    const nextMessage = message.id ? message : makeMessage(message.role, message.content, message);
    setMessages((current) => [...current, nextMessage]);
    return nextMessage;
  };

  const patchMessage = (id, patch) => {
    setMessages((current) => current.map((message) => message.id === id ? { ...message, ...patch } : message));
  };

  const updateLastAssistant = (id, chunk, replace = false) => {
    setMessages((current) => {
      const next = [...current];
      const index = next.findIndex((message) => message.id === id);
      const target = next[index];
      if (target?.role === "assistant" && target.streaming) {
        next[index] = {
          ...target,
          content: replace ? chunk : `${target.content}${chunk}`,
          status: "received",
          receivedAt: target.receivedAt || new Date().toISOString(),
        };
      }
      return next;
    });
  };

  const finalizeAssistant = (id, status = "received") => {
    setMessages((current) => {
      const next = [...current];
      const index = next.findIndex((message) => message.id === id);
      const target = next[index];
      if (target?.role === "assistant") {
        next[index] = {
          ...target,
          streaming: false,
          status,
          receivedAt: target.receivedAt || new Date().toISOString(),
        };
      }
      return next;
    });
  };

  const requestStreamingReply = async (message, effectiveMemory = memory, assistantMessageId) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const payload = {
      session_id: sid(),
      message,
      visitor_name: effectiveMemory.name,
      selected_service: effectiveMemory.service,
      memory: { ...effectiveMemory, stage },
      history: recentHistory,
    };

    const response = await fetch(`${API_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) throw new Error("stream failed");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let received = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      events.forEach((event) => {
        if (event.includes("[DONE]")) return;
        event.split("\n").forEach((line) => {
          if (!line.startsWith("data: ")) return;
          const raw = line.slice(6);
          let chunk = raw;
          try {
            chunk = JSON.parse(raw);
          } catch {
            chunk = raw;
          }
          if (chunk) {
            received = true;
            updateLastAssistant(assistantMessageId, chunk);
          }
        });
      });
    }
    if (!received) throw new Error("empty stream");
  };

  const requestSyncReply = async (message, effectiveMemory = memory) => {
    const { data } = await apiClient.post("/chat", {
      session_id: sid(),
      message,
      visitor_name: effectiveMemory.name,
      selected_service: effectiveMemory.service,
      memory: { ...effectiveMemory, stage },
      history: recentHistory,
    }, { timeout: 50000 });
    return data.reply;
  };

  const assistantReply = async (message, effectiveMemory = memory, userMessageId = null) => {
    if (userMessageId) patchMessage(userMessageId, { status: "sent", sentAt: new Date().toISOString() });
    const assistantMessage = append(makeMessage("assistant", "", {
      streaming: true,
      status: "typing",
      retryFor: message,
    }));
    try {
      await requestStreamingReply(message, effectiveMemory, assistantMessage.id);
      finalizeAssistant(assistantMessage.id, "received");
    } catch {
      try {
        const reply = await requestSyncReply(message, effectiveMemory);
        updateLastAssistant(assistantMessage.id, reply || "I understood your question, but I could not form a complete response. Please send it once more.", true);
        finalizeAssistant(assistantMessage.id, "received");
      } catch {
        updateLastAssistant(assistantMessage.id,
          "I'm sorry, the AI service is temporarily unavailable. I can still help with DortX services, AI, automation, websites, software development, pricing and contact details. Please try again in a moment, or contact **support@dortxtech.com**.",
          true
        );
        finalizeAssistant(assistantMessage.id, "error");
      }
    }
  };

  const askService = (name) => {
    append({
      role: "assistant",
      content: `Nice to meet you, ${name}.\n\nWhat services are you looking for today?`,
      actions: SERVICE_OPTIONS,
    });
  };

  const leadProgress = (lead = {}) => [
    lead.preferred_contact_method ? "✓ Contact preference selected" : "",
    lead.phone ? "✓ Phone number received" : "",
    lead.email ? "✓ Email received" : "",
    (lead.name || memory.name) ? "✓ Name received" : "",
    lead.requirements ? "✓ Project details received" : "",
  ].filter(Boolean).join("\n");

  const shouldSkipLeadField = (field, lead = {}, contextMemory = memory) => {
    if (field.key === "phone") return !contactRequiresPhone(lead) && !lead.phone;
    if (field.key === "name") return Boolean(lead.name || contextMemory.name);
    if (field.key === "email") return isEmail(lead.email || "");
    if (field.key === "project_type") return Boolean(lead.project_type || contextMemory.service);
    return false;
  };

  const nextLeadIndex = (fromIndex, lead = {}, contextMemory = memory) => {
    for (let index = fromIndex; index < LEAD_FIELDS.length; index += 1) {
      if (!shouldSkipLeadField(LEAD_FIELDS[index], lead, contextMemory)) return index;
    }
    return -1;
  };

  const leadQuestion = (field, lead = {}) => {
    if (field.key === "phone" && lead.preferred_contact_method === "WhatsApp") {
      return "Great. Please enter the WhatsApp phone number DortX should use.";
    }
    return field.question;
  };

  const startLeadFlow = (contextMemory = memory) => {
    const lead = {
      ...(contextMemory.lead || {}),
      name: contextMemory.lead?.name || contextMemory.name || "",
      email: contextMemory.lead?.email || contextMemory.email || "",
      phone: contextMemory.lead?.phone || contextMemory.phone || "",
      project_type: contextMemory.lead?.project_type || contextMemory.service || "",
      requirements: contextMemory.lead?.requirements || contextMemory.requirements || "",
      budget: contextMemory.lead?.budget || contextMemory.budget || "",
      timeline: contextMemory.lead?.timeline || contextMemory.timeline || "",
    };
    const firstIndex = nextLeadIndex(0, lead, contextMemory);
    setStage("lead");
    setLeadIndex(firstIndex === -1 ? 0 : firstIndex);
    setMemory((current) => ({ ...current, lead }));
    append({
      role: "assistant",
      content: `${contextMemory.name ? `${contextMemory.name}, ` : ""}I can collect the key details and connect you with the DortX team.\n\n${firstIndex === -1 ? "Please confirm your details so I can submit them." : leadQuestion(LEAD_FIELDS[firstIndex], lead)}`,
    });
  };

  const submitLead = async (lead) => {
    const requirements = [
      lead.requirements,
      `Country: ${lead.country || "Not provided"}`,
      `Preferred contact: ${lead.preferred_contact_method || "Not provided"}`,
    ].filter(Boolean).join("\n");

    const response = await apiClient.post("/chat/lead", {
      session_id: sid(),
      name: lead.name || memory.name,
      company: lead.company || undefined,
      email: lead.email,
      phone: lead.phone || undefined,
      country: lead.country || undefined,
      budget: lead.budget || undefined,
      project_type: lead.project_type || memory.service || undefined,
      timeline: lead.timeline || undefined,
      preferred_contact_method: lead.preferred_contact_method || undefined,
      requirements,
    }, { timeout: 25000 });
    return response;
  };

  const handleLeadAnswer = async (answer) => {
    const field = LEAD_FIELDS[leadIndex];
    const rawValue = String(answer || "").trim();
    const isSkip = rawValue.toLowerCase() === "skip";

    if (!field) {
      append({ role: "assistant", content: "I still need a few details before submitting your request." });
      return;
    }
    if (isSkip && field.required) {
      append({ role: "assistant", content: `${field.label} is required before I can submit your request. ${leadQuestion(field, memory.lead || {})}` });
      return;
    }

    let value = isSkip ? "" : rawValue;
    if (field.key === "preferred_contact_method") {
      value = normalizeContactMethod(value);
      if (!value) {
        append({ role: "assistant", content: "Please choose one contact method: email, phone, or WhatsApp." });
        return;
      }
    }
    if (field.key === "phone" && !isPhone(value)) {
      append({ role: "assistant", content: "Please enter a valid phone number, including the country code if outside India (e.g. +1 415 555 2671)." });
      return;
    }
    if (field.key === "email" && !isEmail(value)) {
      append({ role: "assistant", content: "Please enter a valid email address so DortX can create your request record." });
      return;
    }
    if (field.key === "name" && value.length < 2) {
      append({ role: "assistant", content: "Please enter your name before I submit the request." });
      return;
    }
    if (field.key === "requirements" && value.length < 10) {
      append({ role: "assistant", content: "Please add a little more detail about what you want to build or improve." });
      return;
    }

    const lead = {
      ...(memory.lead || {}),
      [field.key]: value,
      name: field.key === "name" ? value : (memory.lead?.name || memory.name || ""),
      project_type: field.key === "project_type" ? value : (memory.lead?.project_type || memory.service || ""),
    };
    setMemory((current) => ({
      ...current,
      name: field.key === "name" ? value : current.name,
      lead,
    }));

    const nextIndex = nextLeadIndex(leadIndex + 1, lead, { ...memory, lead });
    if (nextIndex !== -1) {
      setLeadIndex(nextIndex);
      append({
        role: "assistant",
        content: `${leadProgress(lead)}\n\n${leadQuestion(LEAD_FIELDS[nextIndex], lead)}`.trim(),
      });
      return;
    }

    setBusy(true);
    try {
      append({ role: "assistant", content: `${leadProgress(lead)}\n\nSubmitting your request...` });
      const response = await submitLead(lead);
      if (![200, 201].includes(response?.status) || response?.data?.success === false) throw new Error("Lead submission failed");
      setStage("chat");
      setLeadIndex(0);
      append({
        role: "assistant",
        content:
          `Thank you${lead.name ? `, ${lead.name}` : ""}! Your request has been successfully submitted to the DortX team. We'll contact you by ${String(lead.preferred_contact_method || "your preferred method").toLowerCase()} as soon as possible.`,
        actions: ["Refine project scope", "What should I prepare?", "Contact Us"],
      });
    } catch {
      append({
        role: "assistant",
        content:
          "Sorry, I couldn't submit your request due to a temporary issue. Please try again in a few moments or contact us directly at **support@dortxtech.com** or **+91 81509 90329**. I have kept your details here so you do not need to retype them.",
      });
    } finally {
      setBusy(false);
    }
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;

    setInput("");
    autoScrollRef.current = true;
    const userMessage = append(makeMessage("user", msg, { status: "sending" }));
    const memoryPatch = deriveMemoryPatch(msg, memory);
    const effectiveMemory = {
      ...memory,
      ...memoryPatch,
      lead: {
        ...(memory.lead || {}),
        ...Object.fromEntries(["email", "phone", "budget", "timeline", "requirements"].filter((key) => memoryPatch[key]).map((key) => [key, memoryPatch[key]])),
      },
    };
    if (Object.keys(memoryPatch).length > 0) setMemory(effectiveMemory);

    if (stage === "name") {
      if (looksLikeConsultingRequest(msg)) {
        setStage("chat");
        setBusy(true);
        await assistantReply(msg, effectiveMemory, userMessage.id);
        setBusy(false);
        return;
      }
      patchMessage(userMessage.id, { status: "sent", sentAt: new Date().toISOString() });
      const name = msg.split(/\s+/).slice(0, 4).join(" ");
      setMemory((current) => ({ ...current, name }));
      setStage("service");
      askService(name);
      return;
    }

    if (stage === "service") {
      const serviceMemory = { ...effectiveMemory, service: msg };
      setMemory(serviceMemory);
      setStage("chat");
      patchMessage(userMessage.id, { status: "sent", sentAt: new Date().toISOString() });
      append({
        role: "assistant",
        content: `Great, ${memory.name || "there"}. I'll keep **${msg}** in mind.\n\nWhat would you like to know or plan first?`,
        actions: QUICK_ACTIONS,
      });
      return;
    }

    if (stage === "lead") {
      patchMessage(userMessage.id, { status: "sent", sentAt: new Date().toISOString() });
      await handleLeadAnswer(msg);
      return;
    }

    if (isBuyingIntent(msg)) {
      patchMessage(userMessage.id, { status: "sent", sentAt: new Date().toISOString() });
      startLeadFlow(effectiveMemory);
      return;
    }

    setBusy(true);
    await assistantReply(msg, effectiveMemory, userMessage.id);
    setBusy(false);
  };

  const onAction = (action) => {
    if (busy) return;
    if (["Book Consultation", "Talk to Sales"].includes(action)) {
      append(makeMessage("user", action, { status: "sent" }));
      startLeadFlow();
      return;
    }
    send(action);
  };

  const retryMessage = async (message) => {
    if (!message?.retryFor || busy) return;
    autoScrollRef.current = true;
    setBusy(true);
    await assistantReply(message.retryFor, memory);
    setBusy(false);
  };

  const copyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(index);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
    }
  };

  const resetChat = () => {
    if (busy) return;
    const confirmed = window.confirm("Start a new chat? This will clear the current conversation on this device.");
    if (!confirmed) return;

    const nextSession = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("dortx-chat-sid", nextSession);
    localStorage.removeItem("dortx-chat-messages");
    localStorage.removeItem("dortx-chat-memory");
    localStorage.setItem("dortx-chat-stage", "name");
    localStorage.setItem("dortx-chat-lead-index", "0");

    abortRef.current?.abort();
    abortRef.current = null;
    autoScrollRef.current = true;
    setMessages([freshInitialAssistantMessage()]);
    setMemory({ name: "", service: "", lead: {} });
    setStage("name");
    setLeadIndex(0);
    setInput("");
    setCopied(null);
    setShowNewMessages(false);
  };

  return (
    <>
      <motion.button
        data-testid="chatbot-toggle"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full gradient-blue text-white flex items-center justify-center shadow-[0_12px_36px_-8px_rgba(30,107,255,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
        aria-label={open ? "Close DortX AI" : "Open DortX AI"}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="chatbot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-3 sm:right-6 z-[60] w-[calc(100vw-1.5rem)] sm:w-[430px] h-[min(640px,calc(100vh-7.5rem))] glass-strong rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            role="dialog"
            aria-label="DortX AI business assistant"
          >
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
              <Logo height={18} />
              <div className="flex-1 ml-1 min-w-0">
                <div className="font-display font-semibold text-white text-[13.5px] leading-tight flex items-center gap-2">
                  DortX AI Assistant <Sparkles size={11} className="text-[#4D8BFF]" />
                </div>
                <div className="text-[11px] text-[#9AA3B8] flex items-center gap-1.5"><span className="dot-pulse" /> Business consulting online</div>
              </div>
              <button
                type="button"
                onClick={resetChat}
                disabled={busy}
                title="Start new chat"
                aria-label="Start new chat"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 text-[11.5px] text-[#C9D2E0] transition hover:border-[#1E6BFF]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
              >
                <RotateCcw size={12} />
                <span className="hidden min-[390px]:inline">New Chat</span>
              </button>
            </div>

            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="relative flex-1 overflow-y-auto px-4 py-4 space-y-3"
              data-testid="chatbot-messages"
              aria-live="polite"
            >
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const previous = messages[index - 1];
                const showDate = !previous || dateKey(previous.createdAt) !== dateKey(message.createdAt);
                const isTyping = message.role === "assistant" && message.streaming && !message.content;
                return (
                  <div key={message.id || index}>
                    {showDate && (
                      <div className="sticky top-0 z-10 my-3 flex justify-center pointer-events-none">
                        <span className="rounded-full bg-[#070B14]/85 border border-white/10 px-3 py-1 text-[10.5px] text-[#9AA3B8] shadow-lg backdrop-blur">
                          {dateLabel(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.18 }}
                      className={`group flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[88%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`px-1 text-[10.5px] font-medium ${isUser ? "text-[#BFD0FF]" : "text-[#9AA3B8]"}`}>
                          {isUser ? "User" : "DortX AI"}
                        </div>
                        <div className={`relative px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-[0_10px_24px_-18px_rgba(0,0,0,0.8)] ${
                          isUser
                            ? "bg-[#1E6BFF] text-white rounded-br-sm"
                            : message.status === "error"
                              ? "bg-[#3A141A]/80 border border-[#F87171]/25 text-[#FFE5E5] rounded-bl-sm"
                              : "bg-white/6 text-[#E7EBF3] rounded-bl-sm"
                        }`}>
                          {isTyping ? (
                            <div className="flex items-center gap-2" role="status" aria-label="DortX AI is typing">
                              <span className="text-[#C9D2E0]">DortX AI is typing</span>
                              <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                              </span>
                            </div>
                          ) : (
                            <MarkdownMessage content={message.content} />
                          )}
                          {message.role === "assistant" && !message.streaming && message.content && (
                            <button
                              type="button"
                              onClick={() => copyMessage(message.content, index)}
                              className="absolute -right-8 top-2 hidden group-hover:flex w-6 h-6 items-center justify-center rounded-full bg-white/8 text-[#C9D2E0] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
                              aria-label="Copy assistant message"
                            >
                              {copied === index ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          )}
                          {message.actions?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {message.actions.map((action) => (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => onAction(action)}
                                  disabled={busy}
                                  className="text-[11.5px] px-2.5 py-1.5 rounded-full bg-white/7 hover:bg-white/12 text-[#DCE6F7] border border-white/10 disabled:opacity-45 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          )}
                          {message.status === "error" && message.retryFor && (
                            <button
                              type="button"
                              onClick={() => retryMessage(message)}
                              disabled={busy}
                              className="mt-3 text-[11.5px] px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                        <div className={`px-1 flex items-center gap-1.5 text-[10.5px] ${isUser ? "text-[#9DB8FF]" : "text-[#7E8799]"}`}>
                          <Check size={10} />
                          <span>{statusLabel(message)}</span>
                          <span>-</span>
                          <span>{formatTime(message.receivedAt || message.sentAt || message.createdAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              {showNewMessages && (
                <button
                  type="button"
                  onClick={scrollToLatest}
                  className="sticky bottom-2 left-1/2 z-20 mx-auto flex -translate-x-0 rounded-full bg-[#1E6BFF] px-3 py-1.5 text-[11.5px] text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
                >
                  New messages
                </button>
              )}
            </div>

            {stage === "chat" && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion}
                    data-testid={`chat-suggestion-${suggestion.slice(0, 10)}`}
                    onClick={() => onAction(suggestion)}
                    disabled={busy}
                    className="text-[11.5px] px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#C9D2E0] border border-white/8 disabled:opacity-45 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(event) => { event.preventDefault(); send(); }}
              className="p-3 border-t border-white/8 flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                data-testid="chatbot-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={stage === "name" ? "Type your name..." : "Ask DortX AI..."}
                aria-label="Message DortX AI"
                className="min-h-10 max-h-28 flex-1 resize-none bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 text-[13.5px] text-[#F7FAFF] placeholder:text-[#6B7385] caret-[#4D8BFF] focus:outline-none focus:border-[#4D8BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
              />
              <button
                data-testid="chatbot-send"
                type="submit"
                disabled={!input.trim() || busy}
                className="w-10 h-10 rounded-full gradient-blue text-white flex items-center justify-center disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
            <div className="px-4 pb-3 text-[10.5px] text-[#6B7385]">Enter to send | Shift+Enter for a new line</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
