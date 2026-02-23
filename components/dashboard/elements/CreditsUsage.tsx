"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ActivityItem {
    id: string;
    title: string;
    type: 'workflow' | 'document' | 'script';
    createdAt: Date;
}

export interface UsageStats {
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

export function CreditsUsage({ stats }: { stats: UsageStats | null }) {
    const creditsUsed = stats?.subscription?.creditsUsed || 0;
    const creditsTotal = stats?.subscription?.creditsTotal || 120;
    const percent = Math.min((creditsUsed / creditsTotal) * 100, 100);
    const radius = 48;
    const circumference = 2 * Math.PI * radius; // ~301.59
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="bg-credits-gradient rounded-xl border border-white/10 shadow-xl overflow-hidden p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">Credits Usage</h3>
                    <p className="text-xs text-blue-200/60 font-medium italic">Integrated with your account plan.</p>
                </div>
                <Link href="/dashboard/topup" className="w-full sm:w-auto">
                    <Button variant="ghost" size="sm" className="w-full sm:w-auto text-base font-semibold normal-case text-white hover:bg-white/10">Top-up Credits</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
