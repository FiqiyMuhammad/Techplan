"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SectionHeader } from "../common/SectionHeader";

// Helper for class merging
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const tabs = [
  {
    title: "Automated AI Curricula Hub",
    description: "Build high-quality, outcome-based curricula in seconds using simple prompts tailored to global academic standards properly",
    image: "/img/curriculum.png"
  },
  {
    title: "The AI AppScript Code Designer",
    description: "Instantly create custom Google Apps Script code for spreadsheets to automate every institutional task and workflow",
    image: "/img/appscript.png"
  },
  {
    title: "Smart Drag & Drop Coordination",
    description: "Manage schedules with intuitive drag-and-drop tools featuring zero overlaps and smart conflict detection today !",
    image: "/img/schedule2.png"
  },
  {
    title: "Brainstorming Design",
    description: "Build mind maps and flow diagrams with intuitive visual tools to unlock every single creative project now",
    image: "/img/workflow2.png"
  }
];

export default function SoftwareV2() {
  const [activeTab, setActiveTab] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play logic
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveTab((prev: number) => (prev + 1) % tabs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section id="features" className="w-full bg-white pt-4 md:pt-12 pb-16 flex items-center flex-col px-6 md:px-8 overflow-hidden">
      <div className="container mx-auto">
        <SectionHeader 
          title="The Intelligent Hub Of Academic Excellence"
          description="From automated AI curriculum design to smart scheduling, TechPlan provides the unified workspace you need to eliminate manual chaos and optimize every single flow"
        />
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 lg:gap-24 items-center">
        
        {/* LEFT: Features List (4 cols) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
          className="lg:col-span-4 flex flex-col gap-6 md:gap-8 order-2 lg:order-1"
        >
          {tabs.map((tab, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, x: -70 },
                visible: { 
                    opacity: 1, 
                    x: 0,
                    transition: { 
                      duration: 1.0, 
                      ease: [0.16, 1, 0.3, 1] 
                    }
                }
              }}
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
                <p className="font-geist text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {tab.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* RIGHT: Browser Mockup (8 cols) */}
        <div className="lg:col-span-8 relative order-1 lg:order-2">
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
                   
                   {/* Image Content */}
                   <div className="absolute inset-0">
                      <Image 
                        src={tabs[activeTab].image} 
                        alt={tabs[activeTab].title}
                        fill
                        className="object-contain"
                        priority
                      />
                      
                      {/* Top/Bottom Gradients to blend with white background */}
                      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
                   </div>
                  
                  {/* Glassy Overlay */}
                   <div className="absolute inset-0 bg-[#368AE3]/5 pointer-events-none" />

                </motion.div>
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>
      

    </section>
  );
}

