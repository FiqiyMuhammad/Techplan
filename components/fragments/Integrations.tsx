"use client";

import React, { useRef } from "react";
import { 
  Database, 
  Cloud, 
  Globe,
  Cpu,
  FileText,
  Usb,
  SquareDashedBottomCode
} from "lucide-react";
import Image from "next/image";
import OrbitingCircles from "@/components/magicui/orbiting-circles";
import { useInView } from "framer-motion";
import { SectionHeader } from "../common/SectionHeader";
import { ScrollReveal } from "../common/ScrollReveal";
import { useState, useEffect } from "react";

export default function Integrations() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.4 });
  const [radius, setRadius] = useState(280);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRadius(150);
      } else if (window.innerWidth < 1024) {
        setRadius(200);
      } else {
        setRadius(280);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const icons = [
    { Icon: Database, id: "db" },
    { Icon: Cpu, id: "curriculum" },
    { Icon: Cloud, id: "cloud" },
    { Icon: FileText, id: "files" },
    { Icon: Usb, id: "brainstorm" },
    { Icon: SquareDashedBottomCode, id: "scheduling" },
    { Icon: Globe, id: "globe" },
  ];

  // Calculate x-position for each icon based on its angle
  const integrationIcons = icons.map((item, i) => {
    const angle = (i * 360) / icons.length;
    const radian = (angle * Math.PI) / 180;
    const xPos = Math.sin(radian); 
    return { ...item, angle, xPos };
  });

  // Sort by x-position descending (Right to Left) to determine stagger rank
  const sortedIcons = [...integrationIcons].sort((a, b) => b.xPos - a.xPos);

  return (
    <section id="integrations" className="relative flex min-h-[600px] md:min-h-[950px] w-full flex-col items-center justify-center overflow-hidden bg-white py-16 md:py-32">
      <div className="container mx-auto px-6 md:px-8 relative z-30">
        <SectionHeader 
          title="Connect Your Entire Institution"
          description={[
            "TechPlan integrates with the tools you already use, creating a",
            "seamless data flow across your entire institutional ecosystem."
          ]}
        />
      </div>

      <div ref={containerRef} className="relative flex h-[400px] md:h-[750px] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
        {/* Center Node: Just the Logo */}
        <div className="relative z-20 flex items-center justify-center">
           <Image 
             src="/logoku/logo1/logo-aja.svg" 
             alt="TechPlan Logo" 
             width={120} 
             height={120}
             className="relative z-10 w-[60px] md:w-[120px] drop-shadow-[0_0_30px_rgba(58,150,246,0.4)]"
           />
           <div className="absolute inset-x-[-20px] md:inset-x-[-40px] inset-y-[-20px] md:inset-y-[-40px] rounded-full bg-blue-500/[0.08] animate-pulse blur-2xl md:blur-3xl" />
        </div>

        {/* Icons pop up in strict Right-to-Left sequence triggered by parent view */}
        {integrationIcons.map((item, idx) => {
          // Find the stagger rank (0 = Rightmost icon)
          const rank = sortedIcons.findIndex(s => s.id === item.id);
          
          return (
            <OrbitingCircles
              key={idx}
              duration={35}
              radius={radius}
              angle={item.angle}
              staggerDelay={rank * 0.12} // Premium sync stagger
              animate={isInView} // Master trigger
              path={idx === 0}
            >
              <div className="size-12 md:size-20 rounded-full bg-white shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform">
                <item.Icon className="h-6 w-6 md:h-10 md:w-10 text-[#3A96F6]" />
              </div>
            </OrbitingCircles>
          );
        })}

        {/* Backdrop Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(58,150,246,0.05),transparent_70%)] pointer-events-none" />

        {/* Vertical Decorative Text - Left */}
        <div className="absolute left-10 top-0 hidden md:flex items-center justify-center h-full pointer-events-none select-none">
          <ScrollReveal delay={0.8} direction="right">
            <span 
              className="text-xl font-medium font-geist tracking-widest text-gray-500 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap"
            >
              Institutional Ecosystem
            </span>
          </ScrollReveal>
        </div>

        {/* Vertical Decorative Text - Right */}
        <div className="absolute right-10 top-0 hidden md:flex items-center justify-center h-full pointer-events-none select-none">
          <ScrollReveal delay={1.0} direction="left">
            <span 
              className="text-xl font-medium font-geist tracking-widest text-gray-500 [writing-mode:vertical-rl] whitespace-nowrap"
            >
              Seamless Connectivity
            </span>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

