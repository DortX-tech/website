import { useNavigate } from "react-router-dom";

const OFFICIAL_LOGO_SRC = "/dortx-logo.png";
const OFFICIAL_LOGO_RATIO = 1403 / 373;

export default function Logo({
  height = 56,
  linkTo = "/",
  className = "",
}) {
  const navigate = useNavigate();
  const maxWidth = Math.round(height * OFFICIAL_LOGO_RATIO);
  const interactiveClass = linkTo
    ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D8BFF]"
    : "";

  const go = () => {
    if (linkTo) navigate(linkTo);
  };

  const onKeyDown = (event) => {
    if (!linkTo) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(linkTo);
    }
  };

  return (
    <img
      data-testid="dortx-logo"
      src={OFFICIAL_LOGO_SRC}
      alt="DortX"
      role={linkTo ? "link" : undefined}
      tabIndex={linkTo ? 0 : undefined}
      onClick={go}
      onKeyDown={onKeyDown}
      draggable={false}
      decoding="async"
      className={`${interactiveClass} ${className}`.trim()}
      style={{
        height,
        width: "auto",
        maxWidth,
        display: "block",
        objectFit: "contain",
        flexShrink: 0,
        filter: "none",
        opacity: 1,
        mixBlendMode: "normal",
        WebkitMaskImage: "none",
        maskImage: "none",
      }}
    />
  );
}
