
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDashboardStats } from "@/lib/actions/stats-actions";
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  BoltIcon,
  CircleStackIcon
} from "@heroicons/react/24/outline";

interface DashboardStats {
  curriculums: number;
  scripts: number;
  total: number;
  hoursSaved: number;
  moneySaved: number;
}

export default function ImpactStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const res = await getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data as DashboardStats);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
        ))}
    </div>
  );

  const impactData = [
    {
        label: "Time Saved",
        value: `${stats?.hoursSaved || 0}h`,
        icon: ClockIcon,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
        label: "Estimated Value",
        value: `Rp ${(stats?.moneySaved || 0).toLocaleString()}`,
        icon: CurrencyDollarIcon,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
        label: "AI Generations",
        value: stats?.total || 0,
        icon: BoltIcon,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20"
    },
    {
        label: "Docs Built",
        value: stats?.curriculums || 0,
        icon: CircleStackIcon,
        color: "text-purple-600",
        bg: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {impactData.map((item, idx) => (
        <motion.div
           key={item.label}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: idx * 0.1 }}
           className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all"
        >
            <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{item.value}</p>
            </div>
        </motion.div>
      ))}
    </div>
  );
}
