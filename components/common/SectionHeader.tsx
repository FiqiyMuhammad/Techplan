"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string | string[];
  subtitle?: string;
  description: string | string[];
  align?: "center" | "left";
  className?: string;
  titleClassName?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  description,
  align = "center",
  className,
  titleClassName,
}: SectionHeaderProps) => {
  const isCenter = align === "center";

  // Staggered Animation Variants (Apple-style spring)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        mass: 1,
        bounce: 0,
      },
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={cn(
        "mb-16 flex flex-col gap-4",
        isCenter ? "items-center text-center mx-auto" : "items-start text-left",
        className
      )}
    >
      {subtitle && (
        <motion.div variants={itemVariants}>
          <span className="text-sm font-bold tracking-wider text-[#3A96F6] uppercase">
            {subtitle}
          </span>
        </motion.div>
      )}

      <div className={cn("flex flex-col gap-1 w-full", isCenter ? "items-center" : "items-start")}>
        {Array.isArray(title) ? (
          title.map((line, idx) => (
            <motion.h2 
              key={idx}
              variants={itemVariants} 
              className={cn(
                "text-[1.65rem] sm:text-[2.5rem] md:text-[3rem] leading-tight font-semibold font-aspekta tracking-[-0.03em] max-w-4xl bg-gradient-to-r from-black from-30% to-[#3A96F6] bg-clip-text text-transparent pb-1",
                isCenter ? "mx-auto" : "",
                titleClassName
              )}
            >
              {line}
            </motion.h2>
          ))
        ) : (
          <motion.h2 
            variants={itemVariants} 
            className={cn(
              "text-[1.65rem] sm:text-[2.5rem] md:text-[3rem] leading-tight font-semibold font-aspekta tracking-[-0.03em] max-w-4xl bg-gradient-to-r from-black from-30% to-[#3A96F6] bg-clip-text text-transparent pb-2",
              isCenter ? "mx-auto" : "",
              titleClassName
            )}
          >
            {title}
          </motion.h2>
        )}
      </div>

      <div className={cn("flex flex-col gap-1 w-full", isCenter ? "items-center" : "items-start")}>
        {Array.isArray(description) ? (
          description.map((line, idx) => (
            <motion.p 
              key={idx}
              variants={itemVariants} 
              className={cn(
                "text-gray-500 text-sm sm:text-base md:text-lg max-w-4xl font-geist leading-relaxed",
                isCenter ? "mx-auto" : ""
              )}
            >
              {line}
            </motion.p>
          ))
        ) : (
          <motion.p 
            variants={itemVariants} 
            className={cn(
              "text-gray-500 text-sm sm:text-base md:text-lg max-w-4xl font-geist leading-relaxed",
              isCenter ? "mx-auto" : ""
            )}
          >
            {description}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};
