"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { getSchedules } from "@/lib/actions/schedule-actions";

interface ScheduleItem {
    id: string;
    title: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    type?: string;
    color?: string;
}

export function AgendaWidget() {
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
        >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                     <h3 className="font-semibold text-gray-900 dark:text-white text-xl mb-1 font-aspekta tracking-tighter">Today&apos;s Agenda</h3>
                     <p className="text-gray-500 text-xs font-geist font-medium">
                        {items.length === 0 ? "You have a clear schedule today." : `You have ${items.length} sessions scheduled.`}
                     </p>
                </div>
                <Link href="/dashboard/schedule" className="w-full sm:w-auto">
                    <div className="bg-gray-50/80 dark:bg-gray-800/50 p-1 rounded-full border border-gray-100/50 dark:border-gray-700/50 shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
                        <div className="bg-white dark:bg-gray-700 px-5 h-9 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:shadow-md transition-all whitespace-nowrap">
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
                        className="py-10 flex flex-col items-center justify-center text-center"
                    >
                        <CalendarIcon className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-geist">Empty Schedule</p>
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
                                <div className="flex items-center gap-2 min-w-[75px]">
                                    <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{timeStr}</span>
                                </div>
                                <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-800" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h4>
                                </div>
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
