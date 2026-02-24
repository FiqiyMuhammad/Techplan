"use client";

import Image from "next/image";
import CircuitCanvas from "../elements/CircuitCanvas";
import { SectionHeader } from "../common/SectionHeader";

export default function Instruction() {
  return (
    <section id="instruction" className="instruction bg-white pt-12 md:pt-24 pb-4 overflow-hidden">
      <div className="container mx-auto px-8">
        <SectionHeader 
          className="mb-8 md:mb-16"
          title={[
            "One Unified System To Build AI Curricula",
            "And Automate Global Institutional Workflows"
          ]}
          description={[
            "Designed to help users move from complex processes to a connected institutional flow — bringing clarity,",
            "automation, and system-level visibility into prompt-based curriculum design, smart scheduling, and automated flows."
          ]}
        />
      </div>
      
      <div className="circuit-container relative w-full h-[280px] md:h-[480px] overflow-hidden">
        {/* Fade edges */}
        <div className="absolute inset-0 pointer-events-none z-[5] bg-[linear-gradient(90deg,white_0%,rgba(255,255,255,0)_15%,rgba(255,255,255,0)_85%,white_100%)]"></div>
        
        <CircuitCanvas />

        <div className="circuit-objects relative z-[10] w-full h-full flex justify-between md:justify-around items-center max-w-[1200px] mx-auto px-4 md:px-8">
          <div id="obj-1" className="obj flex flex-col items-center justify-center p-2 md:p-4">
            <div className="obj-inner relative group transition-transform duration-500 hover:scale-105">
              <Image 
                src="/img/document.svg" 
                alt="Curriculum Data" 
                width={80}
                height={100}
                className="w-[50px] md:w-[100px] h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          <div id="obj-2" className="obj flex flex-col items-center justify-center p-2 md:p-4">
            <div className="obj-inner relative w-[120px] h-[120px] md:w-[240px] md:h-[240px] flex items-center justify-center scale-90 md:scale-100">
               {/* Outer Glow */}
               <div className="absolute inset-0 rounded-full bg-[#3B9AF7]/30 blur-2xl md:blur-3xl"></div>
               
               {/* Spinning Outer Ring (Thick Blue-Black) */}
               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black via-[#368AE3] to-black animate-[spin_3s_linear_infinite] shadow-2xl"></div>
               
               {/* White Layer (Gap) */}
               <div className="absolute inset-[13px] md:inset-[26px] rounded-full bg-white shadow-xl z-10"></div>
               
               {/* Center Gradient with Icon (User Specified Blue) */}
               <div className="absolute inset-[22px] md:inset-[40px] rounded-full bg-gradient-to-br from-[#368AE3] to-[#3B9AF7] flex items-center justify-center z-20 shadow-inner">
                 <Image 
                   src="/logoku/logo2/logo-aja2.svg" 
                   alt="TechPlan Logo" 
                   width={60} 
                   height={60}
                   className="w-[35px] md:w-[110px] brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                 />
               </div>
            </div>
          </div>

          <div id="obj-3" className="obj flex flex-col items-center justify-center p-2 md:p-4">
            <div className="obj-inner relative group transition-transform duration-500 hover:scale-105">
              <Image 
                src="/img/document.svg" 
                alt="Unified Output" 
                width={80}
                height={100}
                className="w-[50px] md:w-[100px] h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

