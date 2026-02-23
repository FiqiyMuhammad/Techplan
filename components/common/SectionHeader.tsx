"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description: string;
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

  // Staggered Animation Variants (Hero Section style)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const, // Custom premium ease from Hero
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

      <motion.div variants={itemVariants} className="w-full">
        <h2 
          className={cn(
            "text-[1.65rem] sm:text-[2.5rem] md:text-[3rem] leading-tight font-semibold font-aspekta tracking-[-0.03em] max-w-4xl bg-gradient-to-r from-black from-30% to-[#3A96F6] bg-clip-text text-transparent pb-2",
            isCenter ? "mx-auto" : "",
            titleClassName
          )}
        >
          {title}
        </h2>
      </motion.div>

      <motion.div variants={itemVariants} className="w-full">
        <p className={cn(
          "text-gray-500 text-sm sm:text-base md:text-lg max-w-4xl font-geist leading-relaxed",
          isCenter ? "mx-auto" : ""
        )}>
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
};
