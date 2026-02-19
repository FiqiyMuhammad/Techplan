"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

const icons = [
  { name: "ChatGPT", icon: "🤖" },
  { name: "Cursor", icon: "🖱️" },
  { name: "Bolt", icon: "⚡" },
  { name: "Zeplin", icon: "🎨" },
  { name: "Vercel", icon: "▲" },
  { name: "GitHub", icon: "🐙" },
  { name: "Next.js", icon: "N" },
  { name: "Figma", icon: "❖" },
].map((item, idx) => ({ ...item, id: idx }));

export default function Orbit() {
  const rotation = useMotionValue(0);
  
  // Create a perfectly synchronized counter-rotation value
  // This guarantees that the items stay upright without jitter
  const negativeRotation = useTransform(rotation, (value) => -value);

  useEffect(() => {
    const controls = animate(rotation, 360, {
      ease: "linear",
      duration: 60,
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [rotation]);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      {/* Visual Orbit Paths */}
      {/* Visual Orbit Paths */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[70%] h-[70%] border border-dashed border-blue-200/50 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute w-[45%] h-[45%] border border-blue-100/30 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.1)]"></div>
      </div>

      {/* Orbiting Icons Container */}
      <motion.div 
        style={{ rotate: rotation }}
        className="absolute inset-0 will-change-transform"
      >
        {/* Reveal Stagger Wrapper */}
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: false, amount: 0.3 }}
           variants={{
             visible: { transition: { staggerChildren: 0.08 } },
             hidden: {}
           }}
           className="absolute inset-0"
        >
          {icons.map((item, idx) => {
            const angle = (idx / icons.length) * 360;
            
            return (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                style={{ rotate: `${angle}deg` }}
                variants={{
                  hidden: { opacity: 0, scale: 0 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
                }}
              >
                <div 
                  className="absolute left-1/2 top-[5%] -translate-x-1/2 -translate-y-1/2"
                >
                  {/* Counter-rotation Wrapper */}
                  <motion.div
                    style={{ rotate: negativeRotation }}
                    className="will-change-transform"
                  >
                    {/* Interactive Card */}
                    <motion.div
                        whileHover={{ scale: 1.15 }}
                        className="w-14 h-14 md:w-20 md:h-20 bg-white border border-gray-100 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-center p-3.5 hover:border-blue-400 hover:shadow-[0_15px_40px_rgba(59,130,246,0.2)] transition-colors cursor-pointer group relative z-10 pointer-events-auto"
                    >
                        <div className="text-3xl md:text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100">
                        {item.icon}
                        </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
