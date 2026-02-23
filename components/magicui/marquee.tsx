"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface MarqueeProps {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
  /**
   * Animation duration in seconds
   * @default 40
   */
  duration?: number;
}

export default function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  children,
  vertical = false,
  repeat = 4,
  duration = 40,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--gap:1rem]",
        vertical ? "flex-col h-full" : "flex-row w-full",
        className
      )}
    >
      <motion.div
        className={cn("flex shrink-0 [gap:var(--gap)]", {
          "flex-row": !vertical,
          "flex-col": vertical,
        })}
        animate={{
          x: vertical ? 0 : reverse ? ["-50%", "0%"] : ["0%", "-50%"],
          y: vertical ? (reverse ? ["-50%", "0%"] : ["0%", "-50%"]) : 0,
        }}
        transition={{
          duration: duration,
          ease: "linear",
          repeat: Infinity,
        }}
        {...(pauseOnHover && {
          whileHover: { animationPlayState: "paused" } as any,
          // Re-implementing pause with CSS since Framer whileHover on animate prop can be tricky
        })}
        style={{
          display: "flex",
          animationPlayState: "inherit",
        }}
      >
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div key={i} className={cn("flex shrink-0 [gap:var(--gap)]", vertical ? "flex-col" : "flex-row")}>
              {children}
            </div>
          ))}
      </motion.div>
    </div>
  );
}
