"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <header id="home" className="relative min-h-[85vh] flex items-center justify-center pt-[140px] pb-[100px] text-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#4F46E5]/8 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#3B82F6]/8 blur-[160px] rounded-full"></div>
      </div>

      <div className="container relative z-10 mx-auto px-8 mt-[-20px]">
        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-title text-[4rem] leading-[1.1] mb-8 tracking-[-0.03em] font-semibold font-aspekta py-2"
        >
          <span className="bg-gradient-to-r from-black from-[45%] to-[#3A96F6] bg-clip-text text-transparent inline-block pb-1">
            Design Curriculum.
          </span> <br />
          <span className="bg-gradient-to-r from-black from-[50%] to-[#3A96F6] bg-clip-text text-transparent inline-block pb-1">
            Automate Scheduling.
          </span> <br />
          <span className="bg-gradient-to-r from-black from-[55%] to-[#3A96F6] bg-clip-text text-transparent inline-block pb-1">
            Improve Learning Flow.
          </span>
        </motion.h1>
        
        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="hero-subtitle text-[1.25rem] text-gray-600 max-w-[800px] mx-auto mb-10 leading-relaxed font-geist"
        >
          An intelligent platform for curriculum engineering, smart scheduling, and learning progress monitoring — built for modern education and training.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="hero-btns flex flex-col sm:flex-row justify-center gap-4 items-center mb-20"
        >
          <Link href="/sign-up" className="group relative btn-primary bg-black text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-zinc-900 transition-all shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 font-geist inline-flex items-center justify-center">
            <span className="relative z-10 flex items-center gap-2">
              Start Free Trial 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
          <button className="btn-secondary bg-white text-black border border-gray-200 px-8 py-3.5 rounded-full font-bold text-base hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-geist">
            See How It Works
          </button>
        </motion.div>
      </div>
    </header>
  );
}
