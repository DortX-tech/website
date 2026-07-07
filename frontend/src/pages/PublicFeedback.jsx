import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import Logo from "@/components/Logo";
import { apiClient } from "@/config/api";

function messageFromError(error) {
  if (error?.response?.status === 410) return "This feedback link has expired or was already used.";
  if (error?.response?.status === 404) return "This feedback link could not be found.";
  return "We could not load this feedback link. Please try again.";
}

export default function PublicFeedback() {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setMessage("");
      try {
        const response = await apiClient.get(`/public/feedback/${token}`);
        if (active) setProject(response.data);
      } catch (error) {
        console.error("Feedback link load failed", error);
        if (active) setMessage(messageFromError(error));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await apiClient.post(`/public/feedback/${token}`, { rating: Number(rating), comment });
      setDone(true);
    } catch (error) {
      console.error("Feedback submit failed", error);
      setMessage(messageFromError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080F] noise flex items-center justify-center px-4 py-10">
      <div className="glass-strong rounded-2xl w-full max-w-xl p-6 sm:p-8">
        <Logo height={28}/>
        <div className="mt-7">
          <div className="font-display text-[26px] font-semibold text-white">Project feedback</div>
          <div className="mt-2 text-[14px] text-[#9AA3B8]">
            {project?.project_name ? `Tell us how ${project.project_name} went.` : "Share your project experience with DortX."}
          </div>
        </div>

        {loading && <div className="mt-6 text-[14px] text-[#9AA3B8]">Loading feedback link...</div>}
        {message && <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-[#C9D2E0]">{message}</div>}
        {done && <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[14px] text-emerald-200">Thank you. Your feedback has been submitted.</div>}

        {!loading && project && !done && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[#6B7385]"><Star size={13}/>Rating</span>
              <input type="number" min="1" max="5" value={rating} onChange={(event) => setRating(event.target.value)} className="contact-field mt-2"/>
            </label>
            <label className="block">
              <span className="text-[12px] uppercase tracking-[0.14em] text-[#6B7385]">Comment</span>
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} className="contact-field mt-2 min-h-[140px]" placeholder="What worked well? What should we improve?"/>
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-60">
              {saving ? "Submitting..." : "Submit feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
