import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import axios from "axios";
import Logo from "./Logo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const sid = () => {
  let s = localStorage.getItem("dortx-chat-sid");
  if (!s) { s = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; localStorage.setItem("dortx-chat-sid", s); }
  return s;
};

const SUGGESTIONS = [
  "What services do you offer?",
  "Can you build AI agents?",
  "How long does a project take?",
  "How do we start working together?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm DortX AI 👋  I can answer questions about our services, technologies and how we work. What would you like to explore?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setBusy(true);
    try {
      const { data } = await axios.post(`${API}/chat`, { session_id: sid(), message: msg });
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "…" }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "I'm having a quiet moment on my end — give me a few seconds and try again. If it keeps happening, you can always reach the team directly at support@dortxtech.com or via the Contact page." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        data-testid="chatbot-toggle"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full gradient-blue text-white flex items-center justify-center shadow-[0_12px_36px_-8px_rgba(30,107,255,0.7)]"
        aria-label="Open DortX AI"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22}/>
            </motion.span>
          ) : (
            <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={22}/>
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
            className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] glass-strong rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
              <Logo height={24} variant="mark" />
              <div className="flex-1 ml-1">
                <div className="font-display font-semibold text-white text-[13.5px] leading-tight flex items-center gap-2">
                  DortX AI <Sparkles size={11} className="text-[#4D8BFF]"/>
                </div>
                <div className="text-[11px] text-[#9AA3B8] flex items-center gap-1.5"><span className="dot-pulse"/> Online · here to help</div>
              </div>
            </div>

            <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" data-testid="chatbot-messages">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#1E6BFF] text-white rounded-br-sm"
                      : "bg-white/6 text-[#E7EBF3] rounded-bl-sm"
                  }`}>{m.content}</div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="bg-white/6 text-[#E7EBF3] px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{animationDelay:'0ms'}}/>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{animationDelay:'120ms'}}/>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{animationDelay:'240ms'}}/>
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} data-testid={`chat-suggestion-${s.slice(0,10)}`} onClick={() => send(s)} className="text-[11.5px] px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#C9D2E0] border border-white/8">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="p-3 border-t border-white/8 flex items-center gap-2"
            >
              <input
                data-testid="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about DortX…"
                className="flex-1 bg-white/5 border border-white/8 rounded-full px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-[#1E6BFF]/60"
              />
              <button
                data-testid="chatbot-send"
                type="submit"
                disabled={!input.trim() || busy}
                className="w-10 h-10 rounded-full gradient-blue text-white flex items-center justify-center disabled:opacity-40"
              >
                <Send size={15}/>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
