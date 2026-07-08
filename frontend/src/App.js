import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import Process from "@/pages/Process";
import Technologies from "@/pages/Technologies";
import Team from "@/pages/Team";
import Careers from "@/pages/Careers";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminErrorBoundary from "@/pages/admin/AdminErrorBoundary";
import PublicFeedback from "@/pages/PublicFeedback";
import PublicAgreement from "@/pages/PublicAgreement";
import NotFound from "@/pages/NotFound";
import useLiveVisitorHeartbeat from "@/hooks/useLiveVisitorHeartbeat";

const BUILD_ID = process.env.REACT_APP_BUILD_ID || "development";
const BUILD_TIME = process.env.REACT_APP_BUILD_TIME || "";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(hash.replace("#", ""));
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }, 0);
  }, [pathname, hash]);

  return null;
}

function PublicLayout({ children }) {
  return (
    <div
      className="min-h-screen noise relative theme-surface"
      data-build-id={BUILD_ID}
      data-build-time={BUILD_TIME}
    >
      <Navbar />
      <main className="relative z-[2]">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}

function LiveHeartbeatManager() {
  const { pathname } = useLocation();
  useLiveVisitorHeartbeat(!pathname.startsWith("/admin"));
  return null;
}

function RequireAdmin({ children }) {
  const token = localStorage.getItem("dortx-admin-token");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LiveHeartbeatManager />
      <Routes>
        <Route path="/admin/login" element={<AdminErrorBoundary><AdminLogin /></AdminErrorBoundary>} />
        <Route path="/admin" element={<AdminErrorBoundary><RequireAdmin><AdminDashboard /></RequireAdmin></AdminErrorBoundary>} />
        <Route path="/feedback/:token" element={<PublicFeedback />} />
        <Route path="/agreement/:agreementId" element={<PublicAgreement />} />

        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
        <Route path="/process" element={<PublicLayout><Process /></PublicLayout>} />
        <Route path="/technologies" element={<PublicLayout><Technologies /></PublicLayout>} />
        <Route path="/team" element={<PublicLayout><Team /></PublicLayout>} />
        <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
        <Route path="/terms-and-conditions" element={<PublicLayout><TermsAndConditions /></PublicLayout>} />
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
