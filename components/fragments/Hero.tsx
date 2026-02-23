"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <header id="home" className="relative min-h-[85vh] flex items-center justify-center pt-[140px] pb-[100px] text-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#4F46E5]/8 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#3B82F6]/8 blur-[160px] rounded-full"></div>
      </div>

      <motion.div 
        className="container relative z-10 mx-auto px-6 md:px-8 mt-[-20px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Headline */}
        <h1 className="hero-title flex flex-col items-center text-center text-[1.65rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] leading-tight md:leading-[1.1] mb-8 tracking-[-0.03em] font-semibold font-aspekta py-2">
          <motion.span 
            variants={itemVariants}
            className="bg-gradient-to-r from-black from-[45%] to-[#3A96F6] bg-clip-text text-transparent pb-1"
          >
            Design Curriculum.
          </motion.span>
          <motion.span 
            variants={itemVariants}
            className="bg-gradient-to-r from-black from-[50%] to-[#3A96F6] bg-clip-text text-transparent pb-1"
          >
            Automated Scheduling.
          </motion.span>
          <motion.span 
            variants={itemVariants}
            className="bg-gradient-to-r from-black from-[55%] to-[#3A96F6] bg-clip-text text-transparent pb-1"
          >
            Improve Learning
          </motion.span>
          <motion.span 
            variants={itemVariants}
            className="bg-gradient-to-r from-black from-[60%] to-[#3A96F6] bg-clip-text text-transparent pb-1"
          >
            Flow.
          </motion.span>
        </h1>
        
        {/* Subheadline */}
        <motion.p 
          variants={itemVariants}
          className="hero-subtitle text-lg sm:text-xl md:text-[1.25rem] text-gray-600 max-w-[800px] mx-auto mb-10 leading-relaxed font-geist"
        >
          An intelligent platform for curriculum engineering, smart scheduling, and learning progress monitoring — built for modern education and training.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="hero-btns flex justify-center mb-20"
        >
          <Link href="#features" className="group relative btn-primary bg-black text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-zinc-900 transition-all shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 font-geist inline-flex items-center justify-center">
            <span className="relative z-10 flex items-center gap-2">
              See More
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </header>
  );
}
