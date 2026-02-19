"use client";

import Image from "next/image";
import CircuitCanvas from "../elements/CircuitCanvas";

export default function Instruction() {
  return (
    <section id="instruction" className="instruction bg-white py-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-8 text-center mb-6">
        <h2 className="section-title text-[2.5rem] leading-tight font-bold mb-6 font-aspekta tracking-tight max-w-3xl mx-auto bg-gradient-to-r from-black from-30% to-[#3A96F6] bg-clip-text text-transparent pb-2">
          One Platform To Simplify Complexity And Create A More Structured, Connected Workflow
        </h2>
        <p className="text-gray-500 text-lg max-w-4xl mx-auto font-geist leading-relaxed">
          Designed to help teams move from scattered processes to a connected operational flow — bringing clarity, automation, and system-level visibility into everyday execution without unnecessary friction or manual overhead.
        </p>
      </div>
      <div className="circuit-container relative w-full h-[550px] overflow-hidden">
        {/* Fade edges */}
        <div className="absolute inset-0 pointer-events-none z-[5] bg-[linear-gradient(90deg,white_0%,rgba(255,255,255,0)_15%,rgba(255,255,255,0)_85%,white_100%)]"></div>
        
        <CircuitCanvas />

        <div className="circuit-objects relative z-[10] w-full h-full flex justify-around items-center max-w-[1200px] mx-auto px-8">
          <div className="obj flex flex-col items-center justify-center p-4" id="obj-1">
            <div className="obj-inner relative group transition-transform duration-500 hover:scale-105">
              <Image 
                src="/img/document.svg" 
                alt="Curriculum Data" 
                width={100}
                height={120}
                className="w-[100px] h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="obj flex flex-col items-center justify-center p-4" id="obj-2">
            <div className="obj-inner relative w-[240px] h-[240px] flex items-center justify-center">
               {/* Outer Glow */}
               <div className="absolute inset-0 rounded-full bg-[#3B9AF7]/30 blur-3xl"></div>
               
               {/* Spinning Outer Ring (Thick Blue-Black) */}
               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black via-[#368AE3] to-black animate-[spin_3s_linear_infinite] shadow-2xl"></div>
               
               {/* White Layer (Gap) */}
               <div className="absolute inset-[25px] rounded-full bg-white shadow-xl z-10"></div>
               
               {/* Center Gradient with Icon (User Specified Blue) */}
               <div className="absolute inset-[45px] rounded-full bg-gradient-to-br from-[#368AE3] to-[#3B9AF7] flex items-center justify-center z-20 shadow-inner">
                 {/* Icon */}
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="16 18 22 12 16 6"></polyline>
                   <polyline points="8 6 2 12 8 18"></polyline>
                 </svg>
               </div>
            </div>
          </div>

          <div className="obj flex flex-col items-center justify-center p-4" id="obj-3">
            <div className="obj-inner relative group transition-transform duration-500 hover:scale-105">
              <Image 
                src="/img/document.svg" 
                alt="Unified Output" 
                width={100}
                height={120}
                className="w-[100px] h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
