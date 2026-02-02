import { useRef, useState } from "react";

export const useMouseGlow = () => {
  const ref = useRef(null);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only set glow if cursor is inside the element
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setGlowPosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setGlowPosition({ x: -999, y: -999 }); // Move glow outside viewport
  };

  return {
    ref,
    glowPosition,
    handleMouseMove,
    handleMouseLeave,
  };
};
