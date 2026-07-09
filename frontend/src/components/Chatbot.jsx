import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, MessageCircle, Send, Sparkles, X } from "lucide-react";
import axios from "axios";
import Logo from "./Logo";

const API = `$process.env.REACT_APP_BACKEND_URL || "https://api.dortxtech.com"

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
  { key: "company", label: "Company", question: "Which company are you representing? You can type 'skip' if this is personal." },
  { key: "email", label: "Email", question: "What email should the DortX team use to contact you?" },
  { key: "phone", label: "Phone", question: "What phone number can the team use? You can type 'skip' if you prefer email." },
  { key: "country", label: "Country", question: "Which country are you based in?" },
  { key: "budget", label: "Budget", question: "Do you have a budget range in mind?" },
  { key: "project_type", label: "Project type", question: "What type of project is this?" },
  { key: "timeline", label: "Timeline", question: "What timeline are you hoping for?" },
  { key: "requirements", label: "Requirements", question: "Please describe your requirements in a few lines." },
  { key: "preferred_contact_method", label: "Preferred contact", question: "How would you prefer DortX to contact you: email, phone, or WhatsApp?" },
];

const initialAssistantMessage = {
  role: "assistant",
  content:
    "👋 Welcome to DortX!\n\nI'm the DortX AI Assistant.\n\nBefore we begin, I'd love to know a little about you.\n\n**What is your name?**",
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
    "book", "consult", "sales", "quote", "proposal", "hire", "start project",
    "build for me", "contact me", "call me", "budget", "timeline",
  ].some((token) => value.includes(token));
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

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
  const [messages, setMessages] = useState(() => loadJson("dortx-chat-messages", [initialAssistantMessage]));
  const [memory, setMemory] = useState(() => loadJson("dortx-chat-memory", { name: "", service: "", lead: {} }));
  const [stage, setStage] = useState(() => localStorage.getItem("dortx-chat-stage") || "name");
  const [leadIndex, setLeadIndex] = useState(() => Number(localStorage.getItem("dortx-chat-lead-index") || 0));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const abortRef = useRef(null);
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  const recentHistory = useMemo(() => messages.slice(-10).map(({ role, content }) => ({ role, content })), [messages]);

  useEffect(() => {
    saveJson("dortx-chat-messages", messages.slice(-40));
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
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

  const append = (message) => setMessages((current) => [...current, message]);

  const updateLastAssistant = (chunk, replace = false) => {
    setMessages((current) => {
      const next = [...current];
      const last = next[next.length - 1];
      if (last?.role === "assistant" && last.streaming) {
        next[next.length - 1] = { ...last, content: replace ? chunk : `${last.content}${chunk}` };
      }
      return next;
    });
  };

  const finalizeAssistant = () => {
    setMessages((current) => {
      const next = [...current];
      const last = next[next.length - 1];
      if (last?.role === "assistant" && last.streaming) {
        next[next.length - 1] = { ...last, streaming: false };
      }
      return next;
    });
  };

  const requestStreamingReply = async (message) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const payload = {
      session_id: sid(),
      message,
      visitor_name: memory.name,
      selected_service: memory.service,
      history: recentHistory,
    };

    const response = await fetch(`${API}/chat/stream`, {
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
            updateLastAssistant(chunk);
          }
        });
      });
    }
    if (!received) throw new Error("empty stream");
  };

  const requestSyncReply = async (message) => {
    const { data } = await axios.post(`${API}/chat`, {
      session_id: sid(),
      message,
      visitor_name: memory.name,
      selected_service: memory.service,
      history: recentHistory,
    }, { timeout: 50000 });
    return data.reply;
  };

  const assistantReply = async (message) => {
    append({ role: "assistant", content: "", streaming: true });
    try {
      await requestStreamingReply(message);
    } catch {
      try {
        const reply = await requestSyncReply(message);
        updateLastAssistant(reply || "I understood your question, but I could not form a complete response. Please send it once more.", true);
      } catch {
        updateLastAssistant(
          "I’m sorry, the AI service is temporarily unavailable. I can still help with DortX services, AI, automation, websites, software development, pricing and contact details. Please try again in a moment, or contact **support@dortxtech.com**.",
          true
        );
      }
    } finally {
      finalizeAssistant();
    }
  };

  const askService = (name) => {
    append({
      role: "assistant",
      content: `Nice to meet you, ${name}.\n\nWhat services are you looking for today?`,
      actions: SERVICE_OPTIONS,
    });
  };

  const startLeadFlow = () => {
    setStage("lead");
    setLeadIndex(0);
    append({
      role: "assistant",
      content: `${memory.name ? `${memory.name}, ` : ""}I can collect the key details and connect you with the DortX team.\n\n${LEAD_FIELDS[0].question}`,
    });
  };

  const submitLead = async (lead) => {
    const requirements = [
      lead.requirements,
      `Country: ${lead.country || "Not provided"}`,
      `Preferred contact: ${lead.preferred_contact_method || "Not provided"}`,
    ].filter(Boolean).join("\n");

    await axios.post(`${API}/chat/lead`, {
      session_id: sid(),
      name: memory.name || lead.name || "Website visitor",
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
  };

  const handleLeadAnswer = async (answer) => {
    const field = LEAD_FIELDS[leadIndex];
    const value = answer.toLowerCase() === "skip" ? "" : answer;
    if (field.key === "email" && !isEmail(value)) {
      append({ role: "assistant", content: "Please enter a valid email address so the DortX team can reach you." });
      return;
    }
    if (field.key === "requirements" && value.length < 10) {
      append({ role: "assistant", content: "Please add a little more detail about what you want to build or improve." });
      return;
    }

    const lead = { ...memory.lead, [field.key]: value };
    setMemory((current) => ({ ...current, lead }));

    const nextIndex = leadIndex + 1;
    if (nextIndex < LEAD_FIELDS.length) {
      setLeadIndex(nextIndex);
      append({ role: "assistant", content: LEAD_FIELDS[nextIndex].question });
      return;
    }

    setBusy(true);
    try {
      await submitLead(lead);
      setStage("chat");
      setLeadIndex(0);
      append({
        role: "assistant",
        content:
          "Thank you. I’ve shared your project details with the DortX team.\n\nThey can follow up using your preferred contact method. Meanwhile, I can still help you refine scope, features, architecture or timeline.",
        actions: ["Refine project scope", "What should I prepare?", "Contact Us"],
      });
    } catch {
      append({
        role: "assistant",
        content:
          "I could not submit the lead right now. Please email **support@dortxtech.com** ...or call **+91 99800 91281** or **+91 81509 90329**. I can still help you prepare the project brief here.",
      });
    } finally {
      setBusy(false);
    }
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;

    setInput("");
    append({ role: "user", content: msg });

    if (stage === "name") {
      const name = msg.split(/\s+/).slice(0, 4).join(" ");
      setMemory((current) => ({ ...current, name }));
      setStage("service");
      askService(name);
      return;
    }

    if (stage === "service") {
      setMemory((current) => ({ ...current, service: msg }));
      setStage("chat");
      append({
        role: "assistant",
        content: `Great, ${memory.name || "there"}. I’ll keep **${msg}** in mind.\n\nWhat would you like to know or plan first?`,
        actions: QUICK_ACTIONS,
      });
      return;
    }

    if (stage === "lead") {
      await handleLeadAnswer(msg);
      return;
    }

    if (isBuyingIntent(msg)) {
      startLeadFlow();
      return;
    }

    setBusy(true);
    await assistantReply(msg);
    setBusy(false);
  };

  const onAction = (action) => {
    if (["Book Consultation", "Talk to Sales"].includes(action)) {
      append({ role: "user", content: action });
      startLeadFlow();
      return;
    }
    send(action);
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
            </div>

            <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" data-testid="chatbot-messages" aria-live="polite">
              {messages.map((message, index) => (
                <div key={index} className={`group flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`relative max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                    message.role === "user"
                      ? "bg-[#1E6BFF] text-white rounded-br-sm"
                      : "bg-white/6 text-[#E7EBF3] rounded-bl-sm"
                  }`}>
                    <MarkdownMessage content={message.content} />
                    {message.role === "assistant" && !message.streaming && (
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
                            className="text-[11.5px] px-2.5 py-1.5 rounded-full bg-white/7 hover:bg-white/12 text-[#DCE6F7] border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start" role="status" aria-label="DortX AI is thinking">
                  <div className="bg-white/6 text-[#E7EBF3] px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              )}
            </div>

            {stage === "chat" && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion}
                    data-testid={`chat-suggestion-${suggestion.slice(0, 10)}`}
                    onClick={() => onAction(suggestion)}
                    className="text-[11.5px] px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#C9D2E0] border border-white/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
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
            <div className="px-4 pb-3 text-[10.5px] text-[#6B7385]">Enter to send • Shift+Enter for a new line</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
