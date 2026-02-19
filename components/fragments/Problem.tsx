"use client";

import { motion } from "framer-motion";
import RevealSection from "../elements/RevealSection";


export default function Problem() {
  return (
    <section id="problem" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-8">
        <RevealSection>
          <div className="text-center mb-20">
            <h2 className="text-[3rem] leading-[1.1] font-semibold font-aspekta mb-6 tracking-tight">
              Education Planning is Still <br />
              <span className="bg-gradient-to-r from-black via-black to-[#3A96F6] bg-clip-text text-transparent">
                Manual and Fragmented
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-geist">
              Traditional methods are slowing down your institution. It&apos;s time to move beyond spreadsheets and scattered files.
            </p>
          </div>
        </RevealSection>

        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
          {/* Top Wide Card - Scattered Documentation */}
          <RevealSection>
            <motion.div 
              whileHover={{ y: -5 }}
              className="group p-1 rounded-[40px] bg-gradient-to-br from-blue-100/30 to-transparent border border-blue-100/20"
            >
              <div className="bg-white rounded-[39px] p-10 md:p-12 flex flex-col lg:flex-row items-center gap-12 border border-gray-100 shadow-sm">
                <div className="flex-1">
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 block">/ Manual Workflow</span>
                  <h3 className="text-3xl font-bold font-aspekta mb-6">The Curse of Scattered <br /> Documentation</h3>
                  <p className="text-gray-500 font-geist leading-relaxed text-lg">
                    Your institution&apos;s most valuable asset—the curriculum—is often trapped in a labyrinth of disconnected spreadsheets, PDFs, and printed files. This fragmentation makes it nearly impossible to maintain a single source of truth, leading to outdated materials and massive administrative overhead during audits or accreditation processes.
                  </p>
                </div>
                <div className="flex-1 w-full aspect-video bg-blue-50/20 rounded-[30px] border border-gray-100/50 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 to-transparent"></div>
                   <div className="relative text-7xl group-hover:scale-110 transition-transform duration-500">📄</div>
                </div>
              </div>
            </motion.div>
          </RevealSection>

          {/* Middle Row - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scheduling Card */}
            <RevealSection>
              <motion.div 
                whileHover={{ y: -5 }}
                className="group p-1 rounded-[40px] bg-gradient-to-br from-blue-100/30 to-transparent border border-blue-100/20 h-full"
              >
                <div className="bg-white rounded-[39px] p-8 h-full flex flex-col border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-[0_20px_50px_rgba(58,150,246,0.05)]">
                  <div className="w-full h-48 bg-blue-50/20 rounded-[30px] border border-gray-100/50 mb-8 flex items-center justify-center relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 to-transparent"></div>
                    <div className="relative text-6xl group-hover:scale-110 transition-transform duration-500 font-bold italic text-blue-200/30">?</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">📅</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold font-aspekta mb-4">Infinite Scheduling Chaos</h3>
                  <p className="text-gray-500 font-geist leading-relaxed text-sm">
                    Manually coordinating hundreds of teachers, rooms, and students is a losing battle. A single change ripple-effects into conflicts everywhere.
                  </p>
                </div>
              </motion.div>
            </RevealSection>

            {/* Visibility Card */}
            <RevealSection>
              <motion.div 
                whileHover={{ y: -5 }}
                className="group p-1 rounded-[40px] bg-gradient-to-br from-blue-100/30 to-transparent border border-blue-100/20 h-full"
              >
                <div className="bg-white rounded-[39px] p-8 h-full flex flex-col border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-[0_20px_50px_rgba(58,150,246,0.05)]">
                  <div className="w-full h-48 bg-blue-50/20 rounded-[30px] border border-gray-100/50 mb-8 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 to-transparent"></div>
                    <div className="relative text-6xl group-hover:scale-110 transition-transform duration-500">👁️</div>
                  </div>
                  <h3 className="text-2xl font-bold font-aspekta mb-4">The Progress Visibility Void</h3>
                  <p className="text-gray-500 font-geist leading-relaxed text-sm">
                    Administrators are flying blind. Tracking attainment of learning outcomes becomes a guessing game without centralized data.
                  </p>
                </div>
              </motion.div>
            </RevealSection>
          </div>

          {/* Bottom Wide Card - Outcome Gap */}
          <RevealSection>
            <motion.div 
              whileHover={{ y: -5 }}
              className="group p-1 rounded-[40px] bg-gradient-to-br from-blue-100/30 to-transparent border border-blue-100/20"
            >
              <div className="bg-white rounded-[39px] p-10 md:p-12 flex flex-col lg:flex-row items-center gap-12 border border-gray-100 shadow-sm text-left">
                <div className="flex-1">
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 block">/ Quality Gap</span>
                  <h3 className="text-3xl font-bold font-aspekta mb-6">The Implementation-Outcome <br /> Gap</h3>
                  <p className="text-gray-500 font-geist leading-relaxed text-lg">
                    What is written in the curriculum often differs from what is actually delivered in the classroom. This misalignment devalues the educational experience and makes it difficult to guarantee quality across diverse learning paths.
                  </p>
                </div>
                <div className="flex-1 w-full aspect-video bg-blue-50/20 rounded-[30px] border border-gray-100/50 flex items-center justify-center relative overflow-hidden lg:order-first">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 to-transparent opacity-50"></div>
                   <div className="relative text-7xl group-hover:scale-110 transition-transform duration-500">🎯</div>
                </div>
              </div>
            </motion.div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
