"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for class merging
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const tabs = [
  {
    title: "AI Curriculum Engineering",
    description: "Build comprehensive, outcome-based curricula in minutes using advanced AI tailored for academic and professional standards.",
  },
  {
    title: "Conflict-Free Smart Scheduling",
    description: "Automate complex scheduling for teachers, rooms, and students with zero overlaps and real-time conflict detection.",
  },
  {
    title: "Progress & Attainment Tracking",
    description: "Monitor learning progress and outcome attainment with centralized data and automated reporting for accreditation.",
  }
];

export default function SoftwareV2() {
  const [activeTab, setActiveTab] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play logic
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section className="w-full bg-white pt-24 pb-24 flex items-center flex-col px-8 overflow-hidden">
      <div className="container mx-auto text-center mb-20">
         {/* Host Title */}
        <h2 className="section-title text-[3rem] leading-tight font-bold mb-6 font-aspekta tracking-tight max-w-3xl mx-auto bg-gradient-to-r from-black from-30% to-[#3A96F6] bg-clip-text text-transparent pb-2">
          One Integrated System <br />For Modern Education
        </h2>
        {/* Host Subtitle */}
        <p className="text-gray-500 text-lg max-w-4xl mx-auto font-geist leading-relaxed">
          From curriculum design to real-time analytics, TechPlan provides the tools you need to run a high-performing educational institution or training center.
        </p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* LEFT: Features List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {tabs.map((tab, idx) => (
            <div
              key={idx}
              className="relative pl-8 cursor-pointer group"
              onClick={() => { setActiveTab(idx); setIsHovered(true); }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Vertical Indicator - Host Color #368AE3 */}
              {activeTab === idx && (
                <motion.div
                  layoutId="v-indicator"
                  className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#368AE3] rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className={cn(
                "transition-all duration-500",
                activeTab === idx ? "opacity-100 translate-x-1" : "opacity-40 group-hover:opacity-60"
              )}>
                <h3 className="text-xl font-bold font-aspekta text-gray-900 mb-2 leading-tight">
                  {tab.title}
                </h3>
                <p className="font-geist text-sm text-gray-500 leading-relaxed">
                  {tab.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Browser Mockup (8 cols) */}
        <div className="lg:col-span-8 relative">
          <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Browser Dots */}
            <div className="h-10 bg-gray-50/50 border-b border-gray-50 flex items-center px-5 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>

            <div className="p-1 relative aspect-[16/10] bg-gray-50/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative w-full h-full rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center group"
                >
                   {/* Placeholder Gradient */}
                   <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
                   
                   {/* Placeholder Content */}
                   <div className="relative z-10 text-center p-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#368AE3] to-[#3B9AF7] mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <span className="text-white font-bold text-xl">{activeTab + 1}</span>
                      </div>
                      <h4 className="text-gray-900 font-bold font-aspekta mb-2">{tabs[activeTab].title}</h4>
                      <p className="text-gray-400 text-sm font-geist">Image Placeholder</p>
                   </div>
                  
                  {/* Glassy Overlay */}
                  <div className="absolute inset-0 bg-[#368AE3]/5 pointer-events-none" />

                  {/* Interactive Button */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div className="bg-[#368AE3] hover:bg-[#3B9AF7] transition-colors px-6 py-2.5 rounded-full text-white font-bold shadow-lg shadow-blue-500/30 text-sm whitespace-nowrap cursor-pointer">
                       Get Started Today
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

               {/* Simulated Cursor - Host Color */}
              <motion.div
                animate={{
                  x: [300, 100, 200, 150, 180], 
                  y: [200, 120, 180, 220, 200],
                  scale: [1, 1, 0.9, 1 , 1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-0 left-0 z-50 pointer-events-none drop-shadow-xl"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5.65376 12.3787L17.2287 4.54226C18.667 3.56707 20.4329 5.33291 19.4577 6.77124L11.6213 18.3462C10.5186 19.9723 8.01759 19.6052 7.42907 17.7219L5.41913 11.29L5.65376 12.3787Z" fill="#368AE3" stroke="white" strokeWidth="2" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <button className="flex items-center justify-center gap-[10px] px-8 h-[54px] rounded-full bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-xl hover:shadow-black/10 mt-16 group font-geist">
        How it works
        <motion.span
           animate={{ x: [0, 5, 0] }}
           transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </motion.span>
      </button>
    </section>
  );
}
