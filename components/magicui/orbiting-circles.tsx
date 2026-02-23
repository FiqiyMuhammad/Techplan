
"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

export interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  radius?: number;
  path?: boolean;
  angle?: number;
  staggerDelay?: number;
  animate?: boolean; // Controlled by parent for synchronous stagger
}

export default function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  radius = 50,
  path = true,
  angle = 0,
  staggerDelay = 0,
  animate = true, // Default to true if not provided
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-black/5 stroke-1 dark:stroke-white/5"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}

      <motion.div
        initial={{ rotate: angle }}
        animate={{
          rotate: angle + (reverse ? -360 : 360),
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          delay: 0,
        }}
        style={{
          width: radius * 2,
          height: radius * 2,
        }}
        className={cn(
          "absolute left-1/2 top-1/2 flex items-center justify-center rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2",
          className,
        )}
      >
        <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -angle }}
            animate={animate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ 
                scale: { type: "spring", stiffness: 1500, damping: 50, delay: staggerDelay },
                opacity: { duration: 0.1, delay: staggerDelay },
                rotate: { duration: duration, repeat: Infinity, ease: "linear" }
            }}
            style={{ y: -radius }}
            className="flex items-center justify-center pointer-events-auto"
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  );
}
