"use client";

import React, { useRef } from "react";
import { 
  FileText,
  Database,
  Cloud,
  ArrowRight,
  Globe,
  Code,
  Cpu,
  SquareDashedBottomCode,
  Sparkles,
  BookText,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Marquee from "@/components/magicui/marquee";
import { AnimatedList } from "@/components/magicui/animated-list";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { SectionHeader } from "../common/SectionHeader";

const files = [
  {
    name: "strategic_growth_v2.pdf",
    body: "Accelerated institutional frameworks synced in real-time.",
  },
  {
    name: "high_velocity_planner.xlsx",
    body: "Precision-engineered scheduling for maximum classroom efficiency.",
  },
  {
    name: "pedagogical_analytics.csv",
    body: "Data-driven insights for rapid curriculum iteration.",
  },
  {
    name: "workflow_standard.doc",
    body: "Optimized operational guides for seamless team alignment.",
  },
  {
    name: "institutional_audit_2026.pdf",
    body: "Zero-friction reporting for streamlined compliance checks.",
  },
];

const notifications = [
  {
    name: "Interactive Mind Map",
    description: "Created new brainstorming for Biology",
    time: "2m ago",
    icon: <Sparkles className="h-5 w-5 text-orange-500" />,
    color: "#fffbeb",
  },
  {
    name: "Admin Automation",
    description: "Script generated for spreadsheet sync",
    time: "15m ago",
    icon: <Code className="h-5 w-5 text-green-600" />,
    color: "#f0fdf4",
  },
  {
    name: "Standard Curriculum",
    description: "New document exported for Physics",
    time: "2h ago",
    icon: <BookText className="h-5 w-5 text-blue-600" />,
    color: "#eff6ff",
  },
  {
    name: "Smart Hub Schedule",
    description: "Calendar sync completed successfully",
    time: "4h ago",
    icon: <CalendarIcon className="h-5 w-5 text-rose-600" />,
    color: "#fff1f2",
  },
];

interface NotificationProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  time: string;
}

const NotificationCard = ({ name, description, icon, color, time }: NotificationProps) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm font-bold sm:text-base">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-gray-500 font-geist">
            {description}
          </p>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full bg-[#D7E4FD]/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-[#D7E4FD]/30 blur-2xl" />
    </figure>
  );
};

const Circle = React.forwardRef<HTMLDivElement, { children?: React.ReactNode; className?: string }>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex h-10 w-10 items-center justify-center rounded-full md:border md:border-blue-500/20 md:bg-slate-900/50 md:backdrop-blur-sm md:shadow-[0_0_20px_-10px_rgba(58,150,246,0.3)]",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

Circle.displayName = "Circle";

const IntegrationsDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#020617]"
      ref={containerRef}
    >
      {/* Graphic Content - Centered & Symmetrical */}
      <div className="relative flex h-full w-full flex-col items-center justify-center space-y-1 md:space-y-4 z-10 p-8">
        {/* Top Row */}
        <div className="flex flex-row items-center justify-center gap-14 md:gap-28 lg:gap-40 w-full px-4">
           <Circle ref={div1Ref} className="h-10 w-10 md:h-14 md:w-14">
             <Database className="h-5 w-5 md:h-7 md:w-7 text-[#3A96F6]" />
           </Circle>
           <div className="h-10 w-24 md:h-14 md:w-32 lg:w-40 invisible shrink-0" />
           <Circle ref={div5Ref} className="h-10 w-10 md:h-14 md:w-14">
             <Cpu className="h-5 w-5 md:h-7 md:w-7 text-[#3A96F6]" />
           </Circle>
        </div>

        {/* Middle Row */}
        <div className="flex flex-row items-center justify-center gap-14 md:gap-28 lg:gap-40 w-full px-4">
          <Circle ref={div2Ref} className="h-10 w-10 md:h-14 md:w-14">
            <Cloud className="h-5 w-5 md:h-7 md:w-7 text-[#3A96F6]" />
          </Circle>

            <div className="relative h-24 w-24 md:h-32 lg:h-36 lg:w-36 md:w-32 flex items-center justify-center">
              {/* Pulsing Outer Glow */}
              <div className="hidden md:block absolute inset-0 rounded-full bg-blue-500/10 animate-ping duration-[4s]" />
              
              {/* Rotating Background & Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="hidden md:flex absolute inset-0 rounded-full bg-gradient-to-br from-[#3A96F6] via-[#3B82F6] to-[#1D4ED8] shadow-[0_0_60px_-10px_rgba(58,150,246,0.5),inset_0_0_30px_rgba(255,255,255,0.2)] items-center justify-center p-1"
              >
                <div className="h-full w-full rounded-full border-[3px] md:border-[5px] border-white/90 border-t-white/30 border-l-white/50" />
              </motion.div>

              {/* Static Central Icon */}
              <motion.div 
                ref={div6Ref}
                animate={{ 
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="z-20 h-11 w-11 md:h-16 lg:h-22 lg:w-22 md:w-16 rounded-full bg-blue-600/20 backdrop-blur-md flex items-center justify-center shadow-inner"
              >
                <Image 
                  src="/logoku/logo2/logo-aja2.svg" 
                  alt="TechPlan Logo" 
                  width={64} 
                  height={64}
                  className="w-7 h-7 md:w-12 lg:w-16 lg:h-16 md:h-12 brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                />
              </motion.div>

              {/* Glossy Reflection (Static) */}
              <div className="hidden md:block absolute top-2.5 md:top-3.5 left-3.5 md:left-5.5 w-1/2 h-1/4 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-[2px] md:blur-[3px] pointer-events-none z-30" />
            </div>
          <Circle ref={div7Ref} className="h-10 w-10 md:h-14 md:w-14">
            <FileText className="h-5 w-5 md:h-7 md:w-7 text-[#3A96F6]" />
          </Circle>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-row items-center justify-center gap-14 md:gap-28 lg:gap-40 w-full px-4">
          <Circle ref={div3Ref} className="h-10 w-10 md:h-14 md:w-14">
            <Globe className="h-5 w-5 md:h-7 md:w-7 text-[#3A96F6]" />
          </Circle>
          <div className="h-10 w-24 md:h-14 md:w-32 lg:w-40 invisible shrink-0" />
          <Circle ref={div4Ref} className="h-10 w-10 md:h-14 md:w-14">
            <SquareDashedBottomCode className="h-5 w-5 md:h-7 md:w-7 text-[#3A96F6]" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} curvature={-70} duration={3} gradientStartColor="#3A96F6" gradientStopColor="#60A5FA" pathOpacity={0.3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} curvature={0} duration={3} gradientStartColor="#3A96F6" gradientStopColor="#60A5FA" pathOpacity={0.3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} curvature={70} duration={3} gradientStartColor="#3A96F6" gradientStopColor="#60A5FA" pathOpacity={0.3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} curvature={70} duration={3} gradientStartColor="#3A96F6" gradientStopColor="#60A5FA" pathOpacity={0.3} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} curvature={-70} duration={3} gradientStartColor="#3A96F6" gradientStopColor="#60A5FA" pathOpacity={0.3} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={div7Ref} toRef={div6Ref} curvature={0} duration={3} gradientStartColor="#3A96F6" gradientStopColor="#60A5FA" pathOpacity={0.3} reverse />
      
      {/* Subtle depth fades */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.3)_100%)] pointer-events-none" />
    </div>
  );
};

const ScatteredDocumentation = () => {
  return (
    <div 
      className="absolute inset-0 flex flex-col justify-between p-6 overflow-hidden"
    >
      {/* Top: Animated Rolling Documents */}
      <div className="relative h-1/2 w-full mt-2">
        <Marquee
          duration={40}
          repeat={10}
          pauseOnHover={false}
          className="[mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"
        >
          {files.map((f, idx) => (
            <figure
              key={idx}
              className={cn(
                "relative w-64 md:w-56 cursor-pointer overflow-hidden rounded-xl border p-5",
                "border-gray-950/[.1] bg-gray-950/[.01]",
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10]",
                "transform-gpu"
              )}
            >
              <div className="flex flex-row items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10">
                   <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <figcaption className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {f.name}
                </figcaption>
              </div>
              <blockquote className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">
                {f.body}
              </blockquote>
            </figure>
          ))}
        </Marquee>
        
        {/* Overlapping blue glow for depth */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(58,150,246,0.03),transparent_80%)]" />
      </div>

      <div className="flex flex-col gap-2 z-10 pt-4">
        <h3 className="text-xl font-bold font-aspekta text-gray-900 dark:text-gray-100">
          Quantum Productivity
        </h3>
        <p className="text-gray-500 font-geist text-sm leading-relaxed">
          Maximize institutional output with high-fidelity document engineering. Automate your complex workflows with unparalleled precision.
        </p>
        <div className="pt-1">
           <Button
              variant="link"
              className="pointer-events-auto p-0 text-[#3A96F6] h-auto text-sm font-bold"
            >
              Get insights <ArrowRight className="ms-2 h-4 w-4" />
           </Button>
        </div>
      </div>
    </div>
  );
};

const SchedulingChaos = () => {
  return (
    <div 
      className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center pointer-events-none pt-0 p-4 md:p-6 gap-1 md:gap-8 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_15%,#000_85%,transparent_100%)]"
    >
      {/* Cards: On top for mobile, left for desktop */}
      <div className="w-full md:w-1/2 flex items-center justify-center md:justify-start scale-90 md:scale-90 origin-center md:origin-left -translate-y-4 md:translate-y-8">
        <AnimatedList className="w-full">
          {notifications.map((item, idx) => (
            <NotificationCard {...item} key={idx} />
          ))}
        </AnimatedList>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center gap-1.5 md:gap-3 p-2 md:pr-4 pointer-events-auto items-center md:items-start text-center md:text-left">
        <div className="flex flex-col gap-1 items-center md:items-start">
           <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] md:text-sm font-bold tracking-wider text-[#3A96F6] uppercase">Real-time Activity</span>
           </div>
           <h3 className="text-xl md:text-2xl font-bold font-aspekta text-gray-900 dark:text-gray-100 leading-tight">
             Integrated Resource Hub
           </h3>
           <p className="text-gray-500 font-geist text-xs md:text-sm leading-relaxed max-w-[280px] md:max-w-full">
             The ultimate engine for institutional agility. Seamlessly engineer and synchronize everything from curriculum frameworks and custom scripts to dynamic planners and visual brainstorms.
           </p>
        </div>
        <div className="pt-1 md:pt-2">
           <Button
              variant="link"
              className="pointer-events-auto p-0 text-[#3A96F6] hover:text-[#368AE3] h-auto text-xs md:text-sm font-bold"
            >
              Learn more <ArrowRight className="ms-2 h-4 w-4" />
           </Button>
        </div>
      </div>
    </div>
  );
};

const VisibilityVoid = () => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6 overflow-hidden">
      {/* Info at top */}
      <div className="flex flex-col gap-2 z-20 mt-2">
        <h3 className="text-xl font-bold font-aspekta text-gray-900 dark:text-gray-100">
          Credits Monitoring 
        </h3>
        <p className="text-gray-500 font-geist text-sm leading-relaxed">
          Always up-to-date information on AI generation credits, current usage and balance across all your institutional projects.
        </p>
      </div>

      {/* Partial Image Preview at bottom */}
      <div className="relative h-1/2 w-[140%] md:w-[120%] -ml-8 md:-ml-4 -mb-16 md:-mb-12">
        <div className="absolute -top-20 left-10 md:-top-14 md:left-20 w-[180%] h-[180%] origin-top-left scale-[0.85] md:scale-[0.5]">
          <Image 
            src="/img/overview.png" 
            alt="Institution Overview" 
            width={1200}
            height={800}
            className="rounded-3xl border border-gray-200/30 shadow-2xl"
          />
        </div>
        
        {/* Subtle fading gradients for the bottom position */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/10 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent z-10" />
      </div>
    </div>
  );
};

const features = [
  {
    Icon: () => null,
    name: "",
    description: "",
    href: "#",
    cta: "",
    className: "col-span-3 lg:col-span-1",
    background: <ScatteredDocumentation />,
  },
  {
    Icon: () => null,
    name: "",
    description: "",
    href: "#",
    cta: "",
    className: "col-span-3 lg:col-span-2 min-h-[300px]",
    background: <SchedulingChaos />,
  },
  {
    Icon: () => null,
    name: "",
    description: "",
    href: "#",
    cta: "",
    className: "hidden lg:flex col-span-3 lg:col-span-2",
    accents: false,
    background: (
      <div className="absolute inset-0 z-0">
        <IntegrationsDemo />
      </div>
    ),
  },
  {
    Icon: () => null,
    name: "",
    description: "",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "",
    background: <VisibilityVoid />,
  },
];

export function BentoDemo() {
  return (
    <section id="specs" className="py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-8">
        <SectionHeader 
          title="Education Planning is Still Manual and Fragmented"
          description={[
            "Traditional methods are slowing down your institution. TechPlan bridges the",
            "gap between manual chaos and digital excellence."
          ]}
        />
        
        <BentoGrid className="max-w-7xl mx-auto">
          {features.map((feature, idx) => (
             <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

