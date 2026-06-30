import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * MagneticButton — softly pulls toward the cursor, then springs back.
 * Pure visual; semantics handled by inner element / parent.
 */
export default function MagneticButton({ children, strength = 22, as: As = "div", className = "", ...rest }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      mx.set(((e.clientX - cx) / r.width) * strength);
      my.set(((e.clientY - cy) / r.height) * strength);
    };
    const onLeave = () => { mx.set(0); my.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my, strength]);

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy, display: "inline-block" }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}
