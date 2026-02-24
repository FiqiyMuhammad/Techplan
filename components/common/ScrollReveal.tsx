"use client";

import { motion, useInView, Variant, Transition } from "framer-motion";
import { useRef, ReactNode } from "react";

type AnimationDirection = "up" | "down" | "left" | "right";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  direction?: AnimationDirection;
  distance?: number;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  className?: string;
  delay?: number;
  once?: boolean;
}

export const ScrollReveal = ({
  children,
  width = "fit-content",
  direction = "up",
  distance = 40,
  variants,
  transition,
  className,
  delay = 0,
  once = true,
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once,
    margin: "-10% 0px -10% 0px" // Only trigger when definitely entering the viewport
  });

  const getInitialStyles = () => {
    switch (direction) {
      case "up": return { y: distance, x: 0 };
      case "down": return { y: -distance, x: 0 };
      case "left": return { x: distance, y: 0 };
      case "right": return { x: -distance, y: 0 };
      default: return { y: distance, x: 0 };
    }
  };

  const defaultVariants = {
    hidden: { opacity: 0, ...getInitialStyles() },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  const defaultTransition: Transition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1,
    bounce: 0,
    delay: delay,
  };

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "visible" }} className={className}>
      <motion.div
        variants={variants || defaultVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={transition || defaultTransition}
      >
        {children}
      </motion.div>
    </div>
  );
};
