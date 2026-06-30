import { Link } from "react-router-dom";

/**
 * DortX official brand logo — pure SVG, infinitely scalable.
 *
 * Visual composition (matches the uploaded brand asset 1:1):
 *   [ silver D | blue X ]  │  DortX   ← metallic silver wordmark
 *                          ─ ─ ─ ─ ─  ← electric-blue accent line
 *                          EMPOWERING BUSINESS THROUGH TECHNOLOGY
 *
 * Variants:
 *   variant="mark"  →  DX  │  DortX                (Navbar, Chatbot, compact)
 *   variant="full"  →  DX  │  DortX + tagline       (Footer, Login, hero)
 */
function BrandSVG({ variant = "mark" }) {
  const showTagline = variant === "full";
  // Canvas sized so the SVG width fits standard layout columns at common heights.
  // Aspect ratios: mark ~ 4.3:1, full ~ 3.0:1
  const vb = showTagline ? "0 0 600 200" : "0 0 560 130";

  return (
    <svg
      viewBox={vb}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DortX — Empowering Business Through Technology"
      style={{ height: "100%", width: "auto", display: "block" }}
    >
      <defs>
        {/* Metallic brushed silver — used for D, the silver diagonal of X, and the DortX wordmark */}
        <linearGradient id="dx-silver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#f7f8fa" />
          <stop offset="22%"  stopColor="#d6d8dd" />
          <stop offset="46%"  stopColor="#8a8d95" />
          <stop offset="58%"  stopColor="#5d6068" />
          <stop offset="78%"  stopColor="#a8abb2" />
          <stop offset="100%" stopColor="#ebedf0" />
        </linearGradient>

        {/* Electric blue → cyan → near-white — the signature gradient of the X */}
        <linearGradient id="dx-blue" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#1f6dff" />
          <stop offset="45%"  stopColor="#48b6ff" />
          <stop offset="80%"  stopColor="#bfe5ff" />
          <stop offset="100%" stopColor="#f2faff" />
        </linearGradient>

        {/* Subtle highlight on the blue X, mimicking polished light reflection */}
        <linearGradient id="dx-blue-hl" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Cyan/blue gradient for the thin accent line under the wordmark */}
        <linearGradient id="dx-accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1f6dff" stopOpacity="0" />
          <stop offset="20%"  stopColor="#48b6ff" stopOpacity="0.95" />
          <stop offset="80%"  stopColor="#1f6dff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1f6dff" stopOpacity="0" />
        </linearGradient>

        {/* Soft outer glow used on the blue X */}
        <filter id="dx-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ====================  DX MARK  ==================== */}
      <g transform="translate(10 12)">
        {/* D — outer shape minus inner cut-out (evenodd) */}
        <path
          fillRule="evenodd"
          fill="url(#dx-silver)"
          d="
            M 0 0
            L 38 0
            C 92 0, 92 100, 38 100
            L 0 100
            Z
            M 16 16
            L 38 16
            C 72 16, 72 84, 38 84
            L 16 84
            Z
          "
        />

        {/* X — silver diagonal (top-left → bottom-right) */}
        <path
          fill="url(#dx-silver)"
          d="M 44 0 L 60 0 L 110 100 L 94 100 Z"
        />

        {/* X — blue diagonal (top-right → bottom-left) */}
        <path
          fill="url(#dx-blue)"
          filter="url(#dx-glow)"
          d="M 94 0 L 110 0 L 60 100 L 44 100 Z"
        />
        {/* highlight streak across the blue diagonal */}
        <path
          fill="url(#dx-blue-hl)"
          d="M 94 0 L 110 0 L 60 100 L 44 100 Z"
          opacity="0.6"
        />
      </g>

      {/* Vertical divider line between mark and wordmark */}
      <line
        x1="142" y1="22" x2="142" y2="110"
        stroke="#9aa0a8" strokeWidth="1.4" opacity="0.55"
      />

      {/* ====================  DortX WORDMARK  ==================== */}
      <text
        x="166" y="92"
        fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif"
        fontSize="84"
        fontWeight="700"
        letterSpacing="-2"
        fill="url(#dx-silver)"
      >
        DortX
      </text>

      {/* ====================  TAGLINE BLOCK  ==================== */}
      {showTagline && (
        <>
          {/* Thin cyan-blue accent line */}
          <rect
            x="166" y="124"
            width="420" height="1.6"
            rx="0.8"
            fill="url(#dx-accent)"
          />
          {/* Tagline text — textLength forces a perfect fit within the accent line width */}
          <text
            x="166" y="166"
            fontFamily="'Inter', system-ui, sans-serif"
            fontSize="19"
            fontWeight="500"
            fill="#e6e8ec"
            textLength="420"
            lengthAdjust="spacingAndGlyphs"
          >
            EMPOWERING BUSINESS THROUGH TECHNOLOGY
          </text>
        </>
      )}
    </svg>
  );
}

/**
 * Public Logo component — renders the SVG brand mark, optionally wrapped in a link.
 */
export default function Logo({
  height = 80,
  variant = "full",
  linkTo = "/",
  className = "",
}) {
  const wrapper = (
    <span
      data-testid="dortx-logo"
      className={`inline-flex items-center select-none ${className}`}
      style={{ height, lineHeight: 0 }}
    >
      <BrandSVG variant={variant} />
    </span>
  );

  if (!linkTo) return wrapper;
  return (
    <Link to={linkTo} data-testid="logo-home-link" className="inline-flex items-center">
      {wrapper}
    </Link>
  );
}
