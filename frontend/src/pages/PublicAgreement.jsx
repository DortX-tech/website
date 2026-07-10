import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Download, PenLine, RefreshCw, Upload } from "lucide-react";
import Logo from "@/components/Logo";
import { BACKEND_URL, apiClient } from "@/config/api";

const CONFIRMATIONS = [
  ["read_understood_entire_agreement", "I have read, understood and agree to this Project Services Agreement, including the project scope, deliverables, payment terms, revisions, timelines, intellectual property, confidentiality and governing law."],
  ["agree_all_terms_and_clauses", "I agree to DortX Technologies' Terms & Conditions, Privacy Policy and Cookie Policy, and confirm that I am authorised to enter into this agreement on behalf of myself or my organisation."],
  ["accurate_information_electronic_consent", "I understand that my electronic signature is legally binding and confirms my acceptance of all terms contained in this agreement."],
];

const SERVICE_WING_FALLBACK = "Software Development";

function valueOrDash(value) {
  return value || "Not specified";
}

function formatDate(value, mode = "date") {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return mode === "datetime" ? parsed.toLocaleString() : parsed.toLocaleDateString();
}

function statusText(value) {
  const mapped = {
    sent_to_client: "sent",
    waiting_dortx_signature: "signed by client",
    executed: "completed",
    signed_by_client: "signed by client",
    signed_by_dortx: "signed by DortX",
  };
  const status = String(mapped[value] || value || "pending").replace(/_/g, " ");
  return status.replace(/\b\w/g, (match) => match.toUpperCase());
}

function serviceWing(agreement) {
  const raw = agreement?.service_wing || agreement?.selected_wing || agreement?.service || agreement?.project_type || agreement?.project_category || "";
  const text = String(raw || "").trim();
  if (text) return text;
  const project = `${agreement?.project_title || ""} ${agreement?.project_name || ""}`.toLowerCase();
  if (project.includes("ai") || project.includes("automation") || project.includes("chatbot")) return "AI Automation";
  if (project.includes("website") || project.includes("web")) return "Website Development";
  return SERVICE_WING_FALLBACK;
}

export default function PublicAgreement() {
  const { agreementId } = useParams();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [agreement, setAgreement] = useState(null);
  const [flags, setFlags] = useState({});
  const [signatureType, setSignatureType] = useState("draw");
  const [signature, setSignature] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientDesignation, setClientDesignation] = useState("");
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAgreement = useCallback(async () => {
    setLoadState("loading");
    setError("");
    setNotice("");
    try {
      const response = await apiClient.get(`/public/agreements/${encodeURIComponent(agreementId)}`);
      const data = response.data;
      if (!data || typeof data !== "object" || !data.id) {
        throw new Error("Agreement response was empty.");
      }
      setAgreement(data);
      setClientName(data?.client_signature?.client_name || data?.client_name || "");
      setLoadState("ready");
    } catch (loadError) {
      console.error("Agreement load failed", loadError);
      setError(loadError?.response?.data?.detail || loadError?.message || "This agreement could not be loaded.");
      setLoadState("error");
    }
  }, [agreementId]);

  useEffect(() => {
    loadAgreement();
  }, [loadAgreement]);

  const allConfirmed = CONFIRMATIONS.every(([key]) => flags[key]);
  const clientSigned = Boolean(agreement?.client_signed);
  const dortxSigned = Boolean(agreement?.dortx_signed);
  const locked = Boolean(agreement?.locked || (clientSigned && dortxSigned));
  const canSign = allConfirmed && signature && clientName.trim() && clientDesignation.trim() && !saving && !clientSigned && !locked;
  const displayedDate = useMemo(() => new Date().toLocaleDateString(), []);

  const point = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0];
    return {
      x: (touch?.clientX ?? event.clientX) - rect.left,
      y: (touch?.clientY ?? event.clientY) - rect.top,
    };
  };

  const startDraw = (event) => {
    if (signatureType !== "draw" || clientSigned || locked) return;
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const draw = (event) => {
    if (!drawing.current || signatureType !== "draw" || clientSigned || locked) return;
    event.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = point(event);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setSignature(canvasRef.current.toDataURL("image/png"));
  };

  const stopDraw = () => {
    drawing.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  };

  const switchSignatureType = (type) => {
    setSignatureType(type);
    clearSignature();
  };

  const signAgreement = async () => {
    if (!canSign) return;
    setSaving(true);
    setNotice("");
    try {
      const response = await apiClient.patch(`/public/agreements/${encodeURIComponent(agreementId)}/sign-client`, {
        acceptance_flags: flags,
        signature_type: signatureType,
        signature,
        client_name: clientName,
        client_designation: clientDesignation,
      });
      setAgreement(response.data);
      setNotice("Agreement Signed Successfully");
    } catch (signError) {
      console.error("Agreement signature failed", signError);
      setNotice(signError?.response?.data?.detail || "Could not sign the agreement. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadState === "loading") {
    return (
      <PageShell>
        <div className="mx-auto flex min-h-[70vh] max-w-[1000px] items-center justify-center px-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-5 text-center text-[#C9D2E0] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="font-display text-[18px] font-semibold text-white">Preparing your agreement</div>
            <div className="mt-2 text-[13px] text-[#9AA3B8]">Securely loading the contract details.</div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (loadState === "error") {
    return (
      <PageShell>
        <div className="mx-auto flex min-h-[70vh] max-w-[760px] items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-red-400/20 bg-[#0A0F1C] p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <Logo height={40} linkTo=""/>
            <h1 className="mt-6 font-display text-[28px] font-semibold text-white">Agreement unavailable</h1>
            <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-7 text-[#C9D2E0]">{error}</p>
            <button onClick={loadAgreement} className="btn-primary mt-6 justify-center">
              <RefreshCw size={16}/> Retry
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-[980px] px-4 py-8 sm:py-12">
        <article className="mx-auto min-h-[1120px] max-w-[900px] bg-white px-7 py-8 text-[#111827] shadow-[0_32px_120px_rgba(0,0,0,0.42)] sm:px-14 sm:py-14 lg:px-20">
          <ContractHeader agreement={agreement}/>

          <div className="pt-10">
            {notice && <div className="mb-6 rounded-xl border border-[#1E6BFF]/20 bg-[#EAF1FF] px-4 py-3 text-[13.5px] text-[#18335E]">{notice}</div>}
            {clientSigned && (
              <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.14)]">
                <div className="flex items-center gap-2 font-display text-[24px] font-semibold text-[#0F172A]">
                  <CheckCircle2 size={22} className="text-emerald-600"/> Agreement Signed Successfully
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DocumentMeta label="Agreement Number" value={agreement.agreement_number || agreement.id}/>
                  <DocumentMeta label="Client Name" value={agreement.client_signature?.client_name || agreement.client_name}/>
                  <DocumentMeta label="Project Name" value={agreement.project_title || agreement.project_name}/>
                  <DocumentMeta label="Signing Date & Time" value={formatDate(agreement.client_signed_at, "datetime")}/>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={`${BACKEND_URL}/api/public/agreements/${agreement.id}/download`} className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-5 py-3 text-[13px] font-semibold text-white hover:bg-[#1E293B]">
                    <Download size={15}/> Download Signed Agreement
                  </a>
                  <a href="/" className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white px-5 py-3 text-[13px] font-semibold text-[#0F172A] hover:border-[#1E6BFF]/40">
                    Return to Website
                  </a>
                </div>
              </div>
            )}

            <div className="border-y border-[#D1D5DB] py-5">
              <p className="text-[16px] leading-[1.8] text-[#374151]">
                This Digital Service Agreement is issued by DortX Technologies for the service wing identified as <strong className="font-semibold text-[#111827]">{serviceWing(agreement)}</strong>. The Agreement records the commercial, technical, legal and execution terms governing the project titled <strong className="font-semibold text-[#111827]">{valueOrDash(agreement.project_title || agreement.project_name)}</strong>, effective from {formatDate(agreement.created_at)}.
              </p>
            </div>

            <section className="mt-10 space-y-10">
              <LegalSection title="Company Information">
                <p>DortX Technologies is a professional technology company delivering AI, software, automation, web, IoT, cloud infrastructure and digital transformation services. The company is represented for this Agreement by Thrisha J C, Founder & Chief Executive Officer (CEO). Official correspondence may be sent to thrisha@dortxtech.com or support@dortxtech.com. MSME Registration Number: UDYAM-KR-25-0108099.</p>
              </LegalSection>

              <LegalSection title="Client Information">
                <DetailGrid items={[
                  ["Client Name", agreement.client_name],
                  ["Company", agreement.company],
                  ["Email", agreement.email],
                  ["Phone", agreement.phone],
                  ["Address", agreement.address],
                  ["Representative Name", agreement.representative_name || agreement.clientInformation?.representativeName],
                  ["Designation", agreement.designation || agreement.clientInformation?.designation],
                ]}/>
              </LegalSection>

              <LegalSection title="Project Details">
                <p>The project covered by this Agreement is titled {valueOrDash(agreement.project_title || agreement.project_name)}. The project description provided for this engagement is as follows: {valueOrDash(agreement.project_description)}.</p>
                <p>The selected Service Wing is {serviceWing(agreement)}. This classification is used to identify the primary delivery discipline for the engagement and does not restrict DortX Technologies from applying related technical, design, automation, infrastructure or consulting capabilities when reasonably required for successful delivery.</p>
              </LegalSection>

              <LegalSection title="Scope of Work">
                <p>DortX Technologies shall provide the professional services, development work, implementation support and related technical activities described in the approved scope. The agreed scope of work for this engagement is: {valueOrDash(agreement.scope_of_work || agreement.project_scope)}.</p>
                <p>Any feature, module, integration, design revision, automation, infrastructure work, content activity, data migration or support responsibility not expressly included in this Agreement shall be treated as outside scope unless both parties approve it in writing.</p>
              </LegalSection>

              <LegalSection title="Deliverables">
                <p>DortX Technologies shall provide the deliverables expressly recorded in this Agreement, including the agreed digital outputs, source code where applicable, configuration support, deployment assistance, documentation, handover guidance and warranty coverage. The currently agreed deliverables are: {valueOrDash(agreement.deliverables || agreement.included_deliverables)}.</p>
              </LegalSection>

              <LegalSection title="Timeline">
                <p>Project Start Date: {valueOrDash(agreement.project_start_date || agreement.start_date)}. Expected Completion Date: {valueOrDash(agreement.expected_completion_date || agreement.expected_delivery_date)}.</p>
                <p>The anticipated timeline for the project is {valueOrDash(agreement.project_timeline || agreement.timeline)}. Milestones: {valueOrDash(agreement.milestones)}. Delivery timelines depend on timely client inputs, approvals, access credentials, content, third-party service availability and payment milestone completion.</p>
              </LegalSection>

              <LegalSection title="Payment Terms">
                <p>The total project value is {valueOrDash(agreement.project_cost || agreement.total_project_cost)} {agreement.currency || ""}. Advance Paid: {valueOrDash(agreement.advance_paid || agreement.advance_payment)}. Balance Amount: {valueOrDash(agreement.balance_amount || agreement.remaining_amount)}.</p>
                <p>Default payment terms are 50% Advance and 50% Before Final Delivery unless otherwise agreed in writing. {agreement.payment_schedule || ""}</p>
                <p>Taxes, payment gateway charges, third-party subscription costs, hosting charges, domain fees, marketplace fees, external API costs and other non-DortX expenses are payable by the Client unless expressly included in the project value.</p>
              </LegalSection>

              <LegalSection title="Revision Policy">
                <p>{agreement.revision_policy || "Maximum 3 revisions are included. Additional revisions are chargeable."}</p>
              </LegalSection>

              <LegalSection title="Confidentiality">
                <p>Both parties shall protect confidential business, technical, financial, operational, credential, product, customer and strategic information shared during the project. Confidential information shall not be disclosed to unauthorized third parties except where required by law or with written permission.</p>
              </LegalSection>

              <LegalSection title="Intellectual Property">
                <p>{agreement.intellectual_property || "Ownership transfers only after full payment. DortX retains reusable frameworks and internal libraries."}</p>
              </LegalSection>

              <LegalSection title="Warranty">
                <p>{agreement.warranty_period || agreement.support_duration || agreement.support_period || "30 days free bug fixing. New features are billed separately."}</p>
              </LegalSection>

              <LegalSection title="Client Responsibilities">
                <p>{agreement.client_responsibilities || "The Client shall provide accurate requirements, timely approvals, content, data, credentials, access, feedback and business decisions required for delivery."}</p>
              </LegalSection>

              <LegalSection title="Termination">
                <p>{agreement.cancellation_policy || "Either party may terminate with written notice. Client must pay for completed work."}</p>
              </LegalSection>

              <LegalSection title="Limitation of Liability">
                <p>{agreement.limitation_of_liability || "Maximum liability is limited to total project value."}</p>
              </LegalSection>

              <LegalSection title="Force Majeure">
                <p>{agreement.force_majeure || "Neither party is liable for delays or failures caused by events beyond reasonable control, including natural disasters, war, strikes, internet outages, government actions, platform outages, or third-party service disruptions."}</p>
              </LegalSection>

              <LegalSection title="Governing Law">
                <p>This Agreement shall be governed by the laws of Karnataka, India. Any disputes arising from this Agreement shall be subject to competent courts in Bengaluru, Karnataka, India.</p>
              </LegalSection>

              <LegalSection title="Digital Signatures">
                <p>By signing this Agreement electronically, the Client confirms that the Agreement has been carefully reviewed, that the Client accepts all payment obligations and responsibilities, and that the electronic signature constitutes legal acceptance of this Agreement. The DortX authorized signatory section records execution on behalf of DortX Technologies.</p>
              </LegalSection>
            </section>

            <div className="mt-10 border-t border-[#D6DEE9] pt-8">
              <ClientExecution
                agreement={agreement}
                flags={flags}
                setFlags={setFlags}
                signatureType={signatureType}
                switchSignatureType={switchSignatureType}
                signature={signature}
                setSignature={setSignature}
                clientName={clientName}
                setClientName={setClientName}
                clientDesignation={clientDesignation}
                setClientDesignation={setClientDesignation}
                displayedDate={displayedDate}
                canvasRef={canvasRef}
                startDraw={startDraw}
                draw={draw}
                stopDraw={stopDraw}
                clearSignature={clearSignature}
                canSign={canSign}
                saving={saving}
                signAgreement={signAgreement}
                clientSigned={clientSigned}
              />

              <DortxExecution agreement={agreement} dortxSigned={dortxSigned}/>

              {agreement?.id && (
                <a href={`${BACKEND_URL}/api/public/agreements/${agreement.id}/download`} className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1E6BFF]/25 bg-[#0A0F1C] px-5 py-3 text-[13px] font-semibold text-white hover:bg-[#111827]">
                  <Download size={15}/> Download Agreement PDF
                </a>
              )}
            </div>
          </div>
        </article>
      </main>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[#05080F] bg-grid text-[#C9D2E0]">
      <div className="bg-radial-glow">
        {children}
      </div>
    </div>
  );
}

function ContractHeader({ agreement }) {
  return (
    <header className="border-b-2 border-[#111827] pb-8">
      <div className="grid gap-6 md:grid-cols-[1fr_1.45fr_1fr] md:items-start">
        <div className="flex items-center">
          <Logo height={44} linkTo=""/>
        </div>
        <div className="text-left md:text-center">
          <div className="text-[15px] font-semibold uppercase tracking-[0.22em] text-[#374151]">DortX Technologies</div>
          <h1 className="mt-3 font-display text-[40px] font-semibold leading-tight tracking-normal text-[#111827]">Digital Service Agreement</h1>
        </div>
        <div className="grid gap-2 text-left md:justify-end md:text-right">
          <HeaderMeta label="Agreement Number" value={agreement.agreement_number || agreement.id}/>
          <HeaderMeta label="Status" value={statusText(agreement.status)}/>
          <HeaderMeta label="Generated Date" value={formatDate(agreement.created_at)}/>
          <HeaderMeta label="Effective Date" value={formatDate(agreement.effective_date || agreement.project_start_date || agreement.created_at)}/>
          <HeaderMeta label="Version" value="1.0"/>
        </div>
      </div>
    </header>
  );
}

function HeaderMeta({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#7C8798]">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold leading-relaxed text-[#111827]">{valueOrDash(value)}</div>
    </div>
  );
}

function DocumentMeta({ label, value }) {
  return (
    <div className="border-l-2 border-[#111827] pl-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#64748B]">{label}</div>
      <div className="mt-1 text-[16px] font-semibold leading-[1.8] text-[#111827]">{valueOrDash(value)}</div>
    </div>
  );
}

function LegalSection({ title, children }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="font-display text-[24px] font-semibold leading-tight text-[#111827]">{title}</h2>
      <div className="mt-3 space-y-4 whitespace-pre-wrap text-[16px] leading-[1.8] text-[#374151]">{children}</div>
    </section>
  );
}

function DetailGrid({ items }) {
  return (
    <div className="space-y-2 text-[16px] leading-[1.8] text-[#374151]">
      {items.map(([label, value]) => (
        <p key={label}><strong className="font-semibold text-[#111827]">{label}:</strong> {valueOrDash(value)}</p>
      ))}
    </div>
  );
}

function ClientExecution(props) {
  const {
    agreement,
    flags,
    setFlags,
    signatureType,
    switchSignatureType,
    signature,
    setSignature,
    clientName,
    setClientName,
    clientDesignation,
    setClientDesignation,
    displayedDate,
    canvasRef,
    startDraw,
    draw,
    stopDraw,
    clearSignature,
    canSign,
    saving,
    signAgreement,
    clientSigned,
  } = props;

  if (clientSigned) {
    return (
      <section className="border-t border-[#D1D5DB] pt-7">
        <div className="flex items-center gap-2 font-display text-[24px] font-semibold text-[#111827]"><CheckCircle2 size={20}/> Client Signature</div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <DocumentMeta label="Signed By" value={agreement.client_signature?.client_name || agreement.client_name}/>
          <DocumentMeta label="Date Signed" value={formatDate(agreement.client_signed_at)}/>
          <DocumentMeta label="Timestamp" value={formatDate(agreement.client_signed_at, "datetime")}/>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-[#D1D5DB] pt-7">
      <h2 className="font-display text-[24px] font-semibold text-[#111827]">Client Confirmation</h2>
      <div className="mt-4 space-y-3">
        {CONFIRMATIONS.map(([key, label]) => (
          <label key={key} className="flex items-start gap-3 border border-[#D1D5DB] bg-white px-4 py-3 text-[16px] leading-[1.8] text-[#374151]">
            <input
              type="checkbox"
              checked={Boolean(flags[key])}
              onChange={(event) => setFlags((current) => ({ ...current, [key]: event.target.checked }))}
              className="mt-1 h-4 w-4 accent-[#1E6BFF]"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="mt-7">
        <h2 className="font-display text-[24px] font-semibold text-[#111827]">Client Signature</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-xl border border-[#D6DEE9] bg-white p-4">
            <div className="inline-flex rounded-lg border border-[#D6DEE9] bg-[#F1F5F9] p-1">
              <button type="button" onClick={() => switchSignatureType("draw")} className={`rounded-md px-4 py-2 text-[12px] font-semibold ${signatureType === "draw" ? "bg-[#0F172A] text-white" : "text-[#475569]"}`}>Draw signature</button>
              <label className={`cursor-pointer rounded-md px-4 py-2 text-[12px] font-semibold ${signatureType === "upload" ? "bg-[#0F172A] text-white" : "text-[#475569]"}`}>
                Upload signature
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      switchSignatureType("upload");
                      setSignature(String(reader.result || ""));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              <button type="button" onClick={() => switchSignatureType("typed")} className={`rounded-md px-4 py-2 text-[12px] font-semibold ${signatureType === "typed" ? "bg-[#0F172A] text-white" : "text-[#475569]"}`}>Type signature</button>
            </div>

            {signatureType === "draw" ? (
              <div className="mt-4">
                <canvas
                  ref={canvasRef}
                  width="820"
                  height="220"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                  className="h-[160px] w-full touch-none rounded-lg border border-[#CBD5E1] bg-[#FBFDFF]"
                />
                <button type="button" onClick={clearSignature} className="mt-2 text-[12px] font-semibold text-[#475569] hover:text-[#0F172A]">Clear signature</button>
              </div>
            ) : (
              signatureType === "upload" ? (
                <div className="mt-4 rounded-lg border border-[#CBD5E1] bg-[#FBFDFF] p-4">
                  {signature ? <img src={signature} alt="Uploaded client signature" className="max-h-[150px] object-contain"/> : <div className="flex items-center gap-2 text-[13px] text-[#64748B]"><Upload size={14}/> Upload a signature image.</div>}
                </div>
              ) : (
                <input value={signature} onChange={(event) => setSignature(event.target.value)} className="mt-4 w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-4 font-display text-[24px] text-[#0F172A] outline-none focus:border-[#1E6BFF]" placeholder="Type your signature"/>
              )
            )}
          </div>

          <div className="grid content-start gap-4">
            <label>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Full Name</span>
              <input value={clientName} onChange={(event) => setClientName(event.target.value)} className="mt-2 w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#0F172A] outline-none focus:border-[#1E6BFF]" placeholder="Enter full legal name"/>
            </label>
            <label>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Designation</span>
              <input value={clientDesignation} onChange={(event) => setClientDesignation(event.target.value)} className="mt-2 w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#0F172A] outline-none focus:border-[#1E6BFF]" placeholder="Your designation"/>
            </label>
            <DocumentMeta label="Date" value={displayedDate}/>
            <button type="button" onClick={signAgreement} disabled={!canSign} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-45">
              <PenLine size={15}/> {saving ? "Signing..." : "Accept & Sign Agreement"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DortxExecution({ agreement, dortxSigned }) {
  return (
    <section className="mt-8 border-t border-[#D1D5DB] pt-7">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">For and on behalf of</div>
      <div className="mt-2 font-display text-[24px] font-semibold uppercase tracking-[0.08em] text-[#111827]">DortX Technologies</div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <DocumentMeta label="Authorized Signatory" value="Thrisha J C"/>
        <DocumentMeta label="Designation" value="Founder & Chief Executive Officer (CEO)"/>
        <DocumentMeta label="MSME Registration" value="UDYAM-KR-25-0108099"/>
        {dortxSigned ? (
          <DocumentMeta label="Status" value="Signed"/>
        ) : (
          <DocumentMeta label="Status" value="Waiting for DortX Signature"/>
        )}
        {dortxSigned && (
          <>
            <DocumentMeta label="Signed By" value="Thrisha J C"/>
            <DocumentMeta label="Date Signed" value={formatDate(agreement.dortx_signed_at)}/>
          </>
        )}
      </div>
    </section>
  );
}
