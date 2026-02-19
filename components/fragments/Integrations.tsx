"use client";

import { motion } from "framer-motion";
import Orbit from "../elements/Orbit";

export default function Integrations() {
  return (
    <section className="py-24 relative flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="container mx-auto relative min-h-[600px] flex items-center justify-center px-4">
        
        {/* Left Text Block */}
        <div className="hidden lg:block absolute left-0 xl:left-8 top-1/2 -translate-y-1/2 z-30">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-4"
                style={{ writingMode: "vertical-rl" }}
            >
                <span className="text-gray-400 font-geist text-sm tracking-widest uppercase mb-4">/ Efficiency</span>
                <h3 className="text-2xl font-bold font-aspekta text-gray-900 rotate-180">Universal Compatibility</h3>
            </motion.div>
        </div>

        {/* Center Orbit */}
        <div className="relative w-full max-w-[600px] md:max-w-[700px] xl:max-w-[800px] aspect-square flex items-center justify-center">
            
            {/* Central Brand Box - Circular & Animated */}
            <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            variants={{
                hidden: { scale: 0.5, opacity: 0 },
                visible: { scale: 1, opacity: 1, transition: { duration: 0.8, type: "spring", bounce: 0.4 } }
            }}
            className="relative z-30 w-28 h-28 md:w-36 md:h-36 bg-white rounded-full shadow-[0_20px_60px_rgba(58,150,246,0.2)] border border-blue-50 flex flex-col items-center justify-center gap-2 z-50"
            >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                ⟨/⟩
            </div>
            <span className="text-xs md:text-sm font-bold font-geist text-gray-900">TechPlan</span>
            <div className="absolute inset-0 -z-10 bg-blue-400/20 blur-3xl rounded-full"></div>
            </motion.div>

            {/* Reusable Orbit Component */}
            <Orbit />
        </div>

        {/* Right Text Block */}
        <div className="hidden lg:block absolute right-0 xl:right-8 top-1/2 -translate-y-1/2 z-30">
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-4"
                style={{ writingMode: "vertical-rl" }}
            >
               <span className="text-gray-400 font-geist text-sm tracking-widest uppercase mb-4">/ Seamless</span>
               <h3 className="text-2xl font-bold font-aspekta text-gray-900 rotate-180">Real-time Synchronization</h3>
            </motion.div>
        </div>

      </div>
    </section>
  );
}
