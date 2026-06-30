import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="font-display text-[120px] sm:text-[180px] leading-none gradient-text font-semibold">404</div>
        <h2 className="font-display text-[26px] mt-4">This page took a detour.</h2>
        <p className="text-[15px] text-[#9AA3B8] mt-3 max-w-md">The page you're looking for doesn't exist — or we may have moved it.</p>
        <Link to="/" className="mt-7 inline-flex btn-primary"><ArrowLeft size={16}/> Back home</Link>
      </div>
    </section>
  );
}
