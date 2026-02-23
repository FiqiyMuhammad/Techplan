"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { 
  CalendarIcon,
  CommandLineIcon,
  BookOpenIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import dynamic from "next/dynamic";

const ToDoList = dynamic(() => import("@/components/dashboard/elements/ToDoList").then(mod => mod.ToDoList), { ssr: false });
const AgendaWidget = dynamic(() => import("@/components/dashboard/elements/AgendaWidget").then(mod => mod.AgendaWidget), { ssr: false });
const Scratchpad = dynamic(() => import("@/components/dashboard/elements/Scratchpad").then(mod => mod.Scratchpad), { ssr: false });
const ActivityHeatmap = dynamic(() => import("@/components/dashboard/ActivityHeatmap"), { ssr: false });
import { Greeting } from "@/components/dashboard/elements/Greeting";
import { ActionCard } from "@/components/dashboard/elements/ActionCard";
import { CreditsUsage } from "@/components/dashboard/elements/CreditsUsage";

import { authClient } from "@/lib/auth-client";
import { getUsageStats } from "@/lib/actions/user-actions";
import type { UsageStats } from "@/components/dashboard/elements/CreditsUsage";

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1] as const
    }
  }
};




// Components moved to separate files for optimization


// Components moved to separate files for optimization

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [stats, setStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    if (session?.user) {
       getUsageStats().then(res => {
          if (res.success && res.data) {
             setStats(res.data as UsageStats);
          }
       });
    }
  }, [session?.user]);

  // No longer blocking the entire page with isPending for better perceived performance
  const user = session?.user as ExtendedUser | undefined;
  const firstName = user?.firstName || user?.name?.split(' ')[0] || "";

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 pb-32 space-y-8 bg-transparent min-h-screen font-inter max-w-[1600px] mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
         <Greeting firstName={firstName || (isPending ? "..." : "")} />
         
         <div className="relative group w-full md:w-96 z-50">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, scripts, or agenda..."
              className="block w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium font-geist shadow-sm"
            />
         </div>
      </motion.div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         {/* 1. Credits Overview */}
         <motion.div variants={itemVariants} className="lg:col-span-2 order-1 lg:order-1">
            <CreditsUsage stats={stats} />
         </motion.div>

         {/* 2. Agenda Widget (Mobile: 2nd, Desktop: Right Col) */}
         <motion.div variants={itemVariants} className="lg:col-span-1 order-2 lg:order-2">
            <AgendaWidget />
         </motion.div>

         {/* 3. To Do List (Mobile: 3rd, Desktop: Right Col) */}
         <motion.div variants={itemVariants} className="lg:col-span-1 order-3 lg:order-4">
            <ToDoList />
         </motion.div>
  
         {/* 4. Professional Tools (Mobile: 4th, Desktop: Left Col) */}
         <div className="lg:col-span-2 space-y-6 order-4 lg:order-3">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold font-aspekta tracking-tight text-gray-900 dark:text-white uppercase text-[11px] tracking-[0.2em] opacity-50">Professional Tools</h2>
            </div>
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard 
                    title="Curriculum" 
                    desc="Design and structure comprehensive academic courses with AI-powered engineering." 
                    icon={BookOpenIcon} 
                    href="/dashboard/curriculum"
                    color="blue"
                />
                <ActionCard 
                    title="AppScript" 
                    desc="Generate and deploy custom Google automations to streamline institution workflows." 
                    icon={CommandLineIcon} 
                    href="/dashboard/appscript-builder"
                    color="emerald"
                />
                <ActionCard 
                    title="Brainstorm" 
                    desc="Unlock creativity with intelligent mind mapping and collaborative ideation canvases." 
                    icon={SparklesIcon} 
                    href="/dashboard/analytics"
                    color="amber"
                />
                <ActionCard 
                    title="Schedule" 
                    desc="Manage your academic calendar, track sessions, and optimize your institution's timeline." 
                    icon={CalendarIcon} 
                    href="/dashboard/schedule"
                    color="blue"
                />
            </motion.div>
         </div>

         {/* 5. Scratchpad (Mobile: 5th, Desktop: Right Col) */}
         <motion.div variants={itemVariants} className="lg:col-span-1 order-5 lg:order-6">
            <Scratchpad />
         </motion.div>

         {/* 6. Activity Heatmap (Mobile: 6th, Desktop: Left Col) */}
         <motion.div variants={itemVariants} className="lg:col-span-2 order-6 lg:order-5 pt-4">
            <ActivityHeatmap userName={firstName} />
         </motion.div>
      </div>
    </motion.div>
  );
}
