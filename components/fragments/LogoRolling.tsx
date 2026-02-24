"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const logos = [
  { src: "/logoku/logo1/firoweb.svg", alt: "Firoweb" },
  { src: "/logoku/logo2/logo-aja2.svg", alt: "TechPlan Logo" },
];

// Repeat logos to create a continuous loop
const scrollingLogos = [...logos, ...logos, ...logos, ...logos, ...logos, ...logos];

export default function LogoRolling() {
  return (
    <div className="w-full py-2 md:py-8 overflow-hidden bg-white">
      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap gap-12 md:gap-24 items-center"
          animate={{
            x: [0, -1000], // Adjust based on total width
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {scrollingLogos.map((logo, idx) => (
            <div key={idx} className="flex-shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={40}
                className="h-8 md:h-10 w-auto object-contain"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {scrollingLogos.map((logo, idx) => (
            <div key={`dup-${idx}`} className="flex-shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={40}
                className="h-8 md:h-10 w-auto object-contain"
              />
            </div>
          ))}
        </motion.div>
        
        {/* Fade gradients for smooth entry/exit */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
      </div>
    </div>
  );
}
