"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    format, 
    subDays, 
    startOfToday, 
    eachDayOfInterval
} from "date-fns";
import { getActivityData } from "@/lib/actions/stats-actions";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface ActivityHeatmapProps {
    userName: string;
}

export default function ActivityHeatmap({ userName }: ActivityHeatmapProps) {
    const [data, setData] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredDay, setHoveredDay] = useState<{ date: Date, count: number } | null>(null);

    const displayName = userName || "User";

    useEffect(() => {
        async function fetchActivity() {
            const res = await getActivityData();
            if (res.success && res.data) {
                setData(res.data);
            }
            setIsLoading(false);
        }
        fetchActivity();
    }, []);

    const days = useMemo(() => {
        const today = startOfToday();
        const start = subDays(today, 182); // ~6 months
        return eachDayOfInterval({ start, end: today });
    }, []);

    const getColor = (count: number) => {
        if (count === 0) return "bg-gray-100 dark:bg-gray-800/50";
        if (count < 2) return "bg-blue-200 dark:bg-blue-900/30";
        if (count < 4) return "bg-blue-400 dark:bg-blue-700/50";
        if (count < 7) return "bg-blue-600 dark:bg-blue-500";
        return "bg-blue-800 dark:bg-blue-400";
    };

    // Group days into weeks
    const weeks = useMemo(() => {
        const weeksArray: Date[][] = [];
        let currentWeek: Date[] = [];
        
        days.forEach((day, i) => {
            currentWeek.push(day);
            if (currentWeek.length === 7 || i === days.length - 1) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        });
        
        return weeksArray;
    }, [days]);

    if (isLoading) {
        return (
            <div className="h-[250px] w-full bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    const totalActivity = Object.values(data).reduce((a, b) => a + b, 0);

    return (
        <div 
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-[var(--shadow-premium)] p-6 overflow-hidden relative"
            style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                     <h3 className="font-semibold text-gray-900 dark:text-white text-xl mb-1 font-aspekta tracking-tighter flex items-center gap-2">
                        {displayName}&apos;s Activity
                        <SparklesIcon className="w-5 h-5 text-blue-500 animate-pulse" />
                     </h3>
                     <p className="text-gray-500 text-xs font-geist font-medium">
                        {totalActivity} total generations in the last 6 months.
                     </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800/50" />
                        <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900/30" />
                        <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700/50" />
                        <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-500" />
                        <div className="w-3 h-3 rounded-sm bg-blue-800 dark:bg-blue-400" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">More</span>
                </div>
            </div>

            <div className="relative">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1.5 shrink-0">
                            {week.map((day, dayIdx) => {
                                const dateStr = format(day, "yyyy-MM-dd");
                                const count = data[dateStr] || 0;
                                return (
                                    <motion.div
                                        key={dateStr}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: (weekIdx * 0.01) + (dayIdx * 0.005) }}
                                        onMouseEnter={() => setHoveredDay({ date: day, count })}
                                        onMouseLeave={() => setHoveredDay(null)}
                                        className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer hover:ring-2 hover:ring-blue-500/50 hover:scale-125 z-10 ${getColor(count)}`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                    {hoveredDay && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-2xl z-50 whitespace-nowrap border border-white/10"
                        >
                            {hoveredDay.count} {hoveredDay.count === 1 ? 'generation' : 'generations'} on {format(hoveredDay.date, "MMM d, yyyy")}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Labels */}
            <div className="mt-4 flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest pr-2">
                <span>{format(subDays(startOfToday(), 182), "MMM yyyy")}</span>
                <span>Today</span>
            </div>

            {/* Background Decorative Pattern */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
