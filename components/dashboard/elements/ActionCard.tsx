"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const cardItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 25 }
    }
};

interface ActionCardProps {
    title: string;
    desc: string;
    icon: React.ElementType;
    href: string;
    color: string;
}

export function ActionCard({ title, desc, icon: Icon, href, color }: ActionCardProps) {
    const themes = {
        blue: {
            iconBg: "bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
            hoverOuter: "hover:border-blue-200/50 dark:hover:border-blue-700/30",
            hoverInner: "group-hover:bg-blue-50/5 dark:group-hover:bg-blue-900/5",
            accent: "bg-blue-500",
            textColor: "text-blue-600 dark:text-blue-400"
        },
        emerald: {
            iconBg: "bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
            hoverOuter: "hover:border-emerald-200/50 dark:hover:border-emerald-700/30",
            hoverInner: "group-hover:bg-emerald-50/5 dark:group-hover:bg-emerald-900/5",
            accent: "bg-emerald-500",
            textColor: "text-emerald-600 dark:text-emerald-400"
        },
        amber: {
            iconBg: "bg-amber-50/80 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
            hoverOuter: "hover:border-amber-200/50 dark:hover:border-amber-700/30",
            hoverInner: "group-hover:bg-amber-50/5 dark:group-hover:bg-amber-900/5",
            accent: "bg-amber-500",
            textColor: "text-amber-600 dark:text-amber-400"
        }
    };

    const colorTheme = themes[color as keyof typeof themes] || {
        iconBg: "bg-gray-50 text-gray-600",
        hoverOuter: "hover:border-gray-200",
        hoverInner: "",
        accent: "bg-gray-500",
        textColor: "text-gray-600"
    };

    return (
        <motion.div 
            variants={cardItemVariants}
            className={cn(
                "group p-1.5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5",
                "transition-all duration-500 shadow-sm",
                colorTheme.hoverOuter
            )}
        >
            <div className={cn(
                "p-7 rounded-[1.3rem] bg-white dark:bg-gray-900 shadow-sm h-full flex flex-col items-center text-center relative overflow-hidden",
                "transition-all duration-500 border border-gray-100/50 dark:border-white/5"
            )}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorTheme.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7" />
                </div>
                
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-aspekta tracking-tight">
                        {title}
                    </h3>
                    
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 font-geist leading-relaxed px-2">
                        {desc}
                    </p>
                </div>
                
                <div className="mt-8 w-full flex justify-center">
                    <Link 
                        href={href} 
                        className={cn(
                            "inline-flex items-center gap-2 text-sm font-bold transition-all px-8 py-3 rounded-full",
                            "bg-gray-50 dark:bg-gray-800/80 text-gray-500 hover:text-white shadow-sm hover:shadow-md",
                            color === 'blue' && "hover:bg-blue-600",
                            color === 'emerald' && "hover:bg-emerald-600",
                            color === 'amber' && "hover:bg-amber-600"
                        )}
                    >
                        Mulai
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
