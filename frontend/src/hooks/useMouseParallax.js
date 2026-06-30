import { useEffect, useState } from "react";

/** Tracks mouse position relative to the viewport (0..1 on both axes). */
export default function useMouseParallax() {
  const [p, setP] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const onMove = (e) => setP({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return p;
}
