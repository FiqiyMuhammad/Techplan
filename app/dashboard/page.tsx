"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { format } from "date-fns";
import { 
  PencilSquareIcon,
  CalendarIcon,
  ArrowRightIcon,
  CommandLineIcon,
  BookOpenIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { TrendingUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";

import { authClient } from "@/lib/auth-client";
import { saveQuickNote, getQuickNote } from "@/lib/actions/note-actions";
import { getSchedules } from "@/lib/actions/schedule-actions";
import { getUsageStats } from "@/lib/actions/user-actions";

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type?: string;
  color?: string;
}
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.25
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.0,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

const greetingVariants: Variants = {
  hidden: { opacity: 0, y: 15, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

const cardContainerVariants: Variants = {
    hidden: { opacity: 0, y: 15, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1] as const,
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const cardItemVariants: Variants = {
    hidden: { opacity: 0, x: -10, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

function Greeting({ firstName }: { firstName: string }) {
  const hour = new Date().getHours();
  let greeting = "Good Day";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  return (
    <div className="space-y-1">
        <h1 className="text-4xl font-semibold font-aspekta tracking-tighter text-gray-900 dark:text-white min-h-[44px] flex items-center">
          {greeting}
          <AnimatePresence mode="wait">
            {firstName && (
                <motion.span 
                    key={firstName}
                    variants={greetingVariants}
                    initial="hidden"
                    animate="visible"
                >
                    , {firstName}.
                </motion.span>
            )}
            {!firstName && (
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    .
                </motion.span>
            )}
          </AnimatePresence>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium font-geist text-sm">
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
    </div>
  );
}



interface ActionCardProps {
  title: string;
  desc: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

function ActionCard({ title, desc, icon: Icon, href, color }: ActionCardProps) {
    const colorClasses = (color === 'blue' || color === 'emerald' || color === 'amber') ? {
        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100",
        emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100",
        amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100",
    }[color] : "bg-gray-50 text-gray-600";

    return (
        <motion.div 
            variants={cardContainerVariants}
            className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full overflow-hidden"
            style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
            <motion.div 
                variants={cardItemVariants}
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                }}
                transition={{ 
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    ease: "anticipate"
                }}
                whileHover={{ 
                    scale: 1.2,
                    rotate: 15,
                    transition: { duration: 0.2 }
                }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colorClasses} shadow-sm`}
            >
                <Icon className="w-6 h-6" />
            </motion.div>
            
            <motion.h3 variants={cardItemVariants} className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </motion.h3>
            
            <motion.p variants={cardItemVariants} className="text-sm text-gray-500 dark:text-gray-400 font-geist mb-6 flex-1">
                {desc}
            </motion.p>
            
            <motion.div variants={cardItemVariants}>
                <Link 
                    href={href} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all group/link"
                >
                    Mulai 
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
            </motion.div>
        </motion.div>
    );
}

interface ActivityItem {
    id: string;
    title: string;
    type: 'workflow' | 'document' | 'script';
    createdAt: Date;
}

interface UsageStats {
    projects: number;
    documents: number;
    subscription: {
        plan: string;
        creditsTotal: number;
        creditsUsed: number;
        expiresAt: Date | null;
    };
    recentWorkflows: ActivityItem[];
    recentDocuments: ActivityItem[];
    recentScripts: ActivityItem[];
}

function CreditsUsage({ stats }: { stats: UsageStats | null }) {
    const creditsUsed = stats?.subscription?.creditsUsed || 0;
    const creditsTotal = stats?.subscription?.creditsTotal || 120;
    const percent = Math.min((creditsUsed / creditsTotal) * 100, 100);
    const radius = 48;
    const circumference = 2 * Math.PI * radius; // ~301.59
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="bg-credits-gradient rounded-xl border border-white/10 shadow-xl overflow-hidden p-6 space-y-6" style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">Credits Usage</h3>
                    <p className="text-xs text-blue-200/60 font-medium italic">Integrated with your account plan.</p>
                </div>
                <Link href="/dashboard/topup">
                    <Button variant="ghost" size="sm" className="text-base font-semibold normal-case text-white hover:bg-white/10">Top-up Credits</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Usage Chart */}
                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10 flex flex-col items-center text-center shadow-inner">
                    <h4 className="text-xs font-semibold text-blue-200/50 mb-4">Overall usage</h4>
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                            <circle 
                                cx="56" 
                                cy="56" 
                                r={radius} 
                                stroke="currentColor" 
                                strokeWidth="10" 
                                fill="transparent" 
                                strokeDasharray={circumference} 
                                strokeDashoffset={offset} 
                                strokeLinecap="round" 
                                className="text-blue-400 transition-all duration-1000" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white leading-none">{creditsUsed}</span>
                            <span className="text-[10px] font-semibold text-blue-200/40 mt-1">/ {creditsTotal}</span>
                        </div>
                    </div>
                    <div className="mt-4 space-y-0.5">
                        <p className="text-xs font-semibold text-white">{percent.toFixed(1)}% used</p>
                        <div className="flex gap-2 items-center justify-center text-[10px] font-medium text-blue-200/40">
                             <span>Credits remaining: {Math.max(creditsTotal - creditsUsed, 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Usage Breakdown */}
                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10 flex flex-col justify-center shadow-inner">
                    <h4 className="text-xs font-semibold text-blue-200/50 mb-4">Usage breakdown</h4>
                    <div className="w-full space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-white">
                                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Document Generation</span>
                                <span className="text-blue-200/60 font-medium">{stats?.documents || 0} items</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_10px_#3b82f6]" style={{ width: `${Math.min((stats?.documents || 0) * 10, 100)}%` }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-white">
                                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-white/20" /> Advanced Projects</span>
                                <span className="text-blue-200/60 font-medium">{stats?.projects || 0} items</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-white/20 transition-all duration-500" style={{ width: `${Math.min((stats?.projects || 0) * 10, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


function Scratchpad() {
    const [note, setNote] = useState("");
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadNote() {
            try {
                const content = await getQuickNote();
                if (content !== null) setNote(content);
            } catch (error) {
                console.error("Failed to load note:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadNote();
    }, []);

    const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNote(val);
        setSaved(false); // Typing...
    };

    // Auto-save debounced or on blur? Let's do a simple save on change with debounce if possible, 
    // but for now let's just use a "save" button or handle it in a way that feels premium.
    // Actually, let's keep it simple: Save on blur for now to avoid too many requests.
    const handleBlur = async () => {
        if (note.trim()) {
            try {
                await saveQuickNote(note);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } catch (error) {
                console.error("Failed to save note:", error);
            }
        }
    };

    return (
        <div 
            className="h-full min-h-[500px] bg-yellow-50 dark:bg-yellow-600/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-6 flex flex-col relative group shadow-sm transition-all"
            style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500 font-bold text-[11px]">
                    <PencilSquareIcon className="w-4 h-4" />
                    <span>Scratchpad</span>
                </div>
                {saved && <span className="text-[10px] font-bold text-yellow-600/50 animate-pulse transition-opacity">Saved</span>}
            </div>
            <Textarea 
                value={note}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                placeholder={isLoading ? "Loading note..." : "Type anything here... Everything is saved automatically."} 
                className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 resize-none text-[15px] font-medium text-gray-800 dark:text-gray-200 placeholder:text-yellow-700/40 dark:placeholder:text-yellow-500/30 leading-relaxed p-0 shadow-none m-0"
                style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
            />
            <div className="mt-4 pt-4 border-t border-yellow-200/50 dark:border-yellow-900/20 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-yellow-700/40 font-bold">Autosaves to local storage</span>
                    <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px] text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-900" 
                    onClick={() => {setNote(""); localStorage.removeItem("tedu_quick_note")}}
                >
                    Clear Notepad
                </Button>
            </div>
        </div>
    )
}


function AgendaWidget() {
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAgenda() {
            try {
                const today = new Date();
                const data = await getSchedules(today);
                setItems(data as ScheduleItem[]);
            } catch (error) {
                console.error("Failed to fetch agenda:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAgenda();
    }, []);

    if (isLoading) return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div 
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100/50 dark:border-gray-800 shadow-[var(--shadow-premium)] p-6"
            style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
            <div className="flex justify-between items-start mb-8">
                <div>
                     <h3 className="font-semibold text-gray-900 dark:text-white text-xl mb-1 font-aspekta tracking-tighter">Today&apos;s Agenda</h3>
                     <p className="text-gray-500 text-xs font-geist font-medium">
                        {items.length === 0 ? "You have a clear schedule today." : `You have ${items.length} sessions scheduled.`}
                     </p>
                </div>
                <Link href="/dashboard/schedule">
                    <div className="bg-gray-50/80 dark:bg-gray-800/50 p-1 rounded-full border border-gray-100/50 dark:border-gray-700/50 shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
                        <div className="bg-white dark:bg-gray-700 px-5 h-9 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:shadow-md transition-all whitespace-nowrap">
                            calendar
                            <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                    </div>
                </Link>
            </div>
            
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                {items.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        className="py-16 flex flex-col items-center justify-center text-center"
                    >
                        <CalendarIcon className="w-12 h-12 mb-4 text-gray-400" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Empty Schedule</p>
                    </motion.div>
                )}
                {items.map((item, idx) => {
                    const timeStr = item.startTime || "09:00";
                    
                    const isOnline = item.type?.toLowerCase() === 'online';
                    
                    return (
                        <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center p-2.5 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                        >
                            <div className="flex items-center gap-5 w-full">
                                {/* Time - 24h Format */}
                                <div className="flex items-center gap-2 min-w-[75px]">
                                    <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{timeStr}</span>
                                </div>
                                
                                {/* Divider like Topbar */}
                                <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-800" />

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h4>
                                </div>

                                {/* Divider like Topbar */}
                                <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-800" />

                                <div className="shrink-0 flex items-center pr-2">
                                    <span className={`text-sm font-medium ${
                                        isOnline 
                                            ? 'text-emerald-500/80 dark:text-emerald-400/80' 
                                            : 'text-blue-500/80 dark:text-blue-400/80'
                                    }`}>
                                        {item.type || 'event'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
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

  const user = session?.user as ExtendedUser | undefined;
  const firstName = user?.firstName || user?.name?.split(' ')[0] || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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
      className="p-6 pb-32 space-y-6 bg-transparent min-h-screen font-inter max-w-[1600px] mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
         <Greeting firstName={firstName} />
         
         {/* Search Bar - Global Command Center */}
         <div className="relative group w-full md:w-96 z-50">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200) /* delay to allow clicks */}
              placeholder="Search projects, scripts, or agenda..."
              className="block w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium font-geist shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            {/* Quick Results Dropdown (Mock) */}
            <AnimatePresence>
                {isSearchFocused && searchQuery.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute mt-2 w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden py-1"
                    >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                            Search Results for &quot;{searchQuery}&quot;
                        </div>
                        <div className="px-1 space-y-0.5">
                            {[
                                { title: "Curriculum: Intro to AI", type: "Course" },
                                { title: "Script: Data Automation", type: "AppScript" },
                                { title: "Meeting: Review Session", type: "Agenda" }
                            ].map((result, i) => (
                                <button key={i} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg group">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        {result.title}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold uppercase">
                                        {result.type}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      </motion.div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         {/* Main Workspace (Left) */}
         <div className="lg:col-span-2 space-y-8">
             {/* Credits Usage at the top left column */}
             <motion.div variants={itemVariants}>
                <CreditsUsage stats={stats} />
             </motion.div>
             
             {/* Action Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard 
                    title="Curriculum" 
                    desc="Design & visualize courses" 
                    icon={BookOpenIcon} 
                    href="/dashboard/curriculum"
                    color="blue"
                />
                <ActionCard 
                    title="AppScript" 
                    desc="Automate with custom scripts" 
                    icon={CommandLineIcon} 
                    href="/dashboard/appscript-builder"
                    color="emerald"
                />
                <ActionCard 
                    title="Brainstorm" 
                    desc="Ideation and mind mapping" 
                    icon={SparklesIcon} 
                    href="/dashboard/analytics"
                    color="amber"
                />
                 <ActionCard 
                    title="Analytics" 
                    desc="Track your progress" 
                    icon={TrendingUpIcon} 
                    href="/dashboard/analytics"
                    color="blue"
                />
             </div>

             {/* Activity Heatmap Section */}
             <motion.div variants={itemVariants} className="pt-4">
                <ActivityHeatmap userName={firstName} />
             </motion.div>
         </div>
 
         {/* Sidebar (Right) */}
         <div className="lg:col-span-1 space-y-6">
             <motion.div variants={itemVariants}>
                <AgendaWidget />
             </motion.div>
             <motion.div variants={itemVariants}>
                <Scratchpad />
             </motion.div>
         </div>
       </div>
    </motion.div>
  );
}
