"use client";

import { motion } from "framer-motion";

export default function Extension() {
  return (
    <section id="extension" className="extension bg-white py-32 text-center overflow-hidden relative">
      <div className="container mx-auto px-8 relative z-10">
        <div className="mb-20">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-4 block inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
            / Accessibility
          </span>
          <h2 className="section-title text-[3rem] md:text-[4rem] font-bold mb-6 font-aspekta tracking-tight text-gray-900 leading-[1.1]">
            Unified Mobile <br/> <span className="text-blue-600">Experience</span>
          </h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-geist leading-relaxed">
            Faculty and students stay connected with real-time schedule updates, resource access, and progress tracking on any device.
          </p>
        </div>
        
        <div className="relative mx-auto max-w-[1200px] h-[600px] flex items-center justify-center">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/30 blur-[100px] rounded-full pointer-events-none -z-10"></div>
            
            {/* Main Device Mockup */}
            <motion.div 
                initial={{ y: 50, opacity: 0, rotateX: 20 }}
                whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                viewport={{ once: false, margin: "-100px" }}
                className="relative z-10 w-[300px] md:w-[380px] h-[600px] md:h-[700px] bg-gray-900 rounded-[50px] border-[12px] border-gray-900 shadow-2xl overflow-hidden"
            >
                {/* Screen Content */}
                <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="h-24 bg-blue-600 p-6 pt-10 flex justify-between items-start text-white">
                        <div className="font-bold text-lg font-aspekta">Dashboard</div>
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md"></div>
                    </div>
                    
                    {/* Content Body */}
                    <div className="p-6 bg-gray-50 flex-1 flex flex-col gap-4">
                        {/* Stat Card */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-2">Next Class</div>
                            <div className="text-lg font-bold text-gray-900 font-aspekta">Advanced Algorithms</div>
                            <div className="text-blue-600 text-sm font-medium mt-1">10:00 AM • Lab 3</div>
                        </div>
                        
                        {/* Progress */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                             <div className="flex justify-between items-center mb-3">
                                <div className="text-xs text-gray-400 font-bold uppercase">Completion</div>
                                <div className="text-green-500 text-xs font-bold">84%</div>
                             </div>
                             <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "84%" }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className="h-full bg-green-500 rounded-full"
                                 ></motion.div>
                             </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                             <div className="text-xs text-gray-400 font-bold uppercase mb-4">Activity</div>
                             <div className="space-y-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                                        <div className="flex-1">
                                            <div className="h-2 w-24 bg-gray-100 rounded mb-1"></div>
                                            <div className="h-2 w-16 bg-gray-50 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                    
                    {/* Bottom Nav */}
                    <div className="h-20 bg-white border-t border-gray-100 flex justify-around items-center px-6">
                        <div className="w-6 h-6 rounded bg-blue-600"></div>
                        <div className="w-6 h-6 rounded bg-gray-200"></div>
                        <div className="w-6 h-6 rounded bg-gray-200"></div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Notification 1 - Left */}
            <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                className="absolute top-[20%] left-[5%] md:left-[15%] z-20 hidden md:block"
            >
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 w-64 flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        ✅
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-gray-900">Assignment Graded</div>
                        <div className="text-xs text-gray-500">Just now</div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Notification 2 - Right */}
            <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[30%] right-[5%] md:right-[15%] z-20 hidden md:block"
            >
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 w-64 flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        🔔
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-gray-900">New Schedule Conflict</div>
                        <div className="text-xs text-gray-500">2 min ago • Auto-Resolved</div>
                    </div>
                </div>
            </motion.div>

        </div>
      </div>
    </section>
  );
}
