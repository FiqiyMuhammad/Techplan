"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        duration: 1.5, 
        orientation: "vertical", 
        smoothWheel: true,
        lerp: 0.1, // Nilai lerp untuk kehalusan ekstra
      }}
    >
      {children}
    </ReactLenis>
  );
}
