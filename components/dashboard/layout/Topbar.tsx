"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/components/providers/ThemeProvider";
import { motion, Variants } from "framer-motion";
import { useSidebarStore } from "@/store/useSidebarStore";
import Image from "next/image";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeftOnRectangleIcon 
} from "@heroicons/react/24/outline";

import { authClient } from "@/lib/auth-client";

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

const topbarContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

const topbarItemVariants: Variants = {
  hidden: { opacity: 0, x: 10, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed } = useSidebarStore();
  const [time, setTime] = useState<Date | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const name = session?.user?.name || "User";
  const user = session?.user as ExtendedUser | undefined;
  const firstName = user?.firstName || name.split(' ')[0];
  const lastName = user?.lastName || name.split(' ')[1] || "";
  const initials = firstName[0] + (lastName ? lastName[0] : "");

  return (
    <header className={`fixed top-0 right-0 z-40 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 h-14 flex items-center justify-end ${isCollapsed ? 'left-20' : 'left-64'}`}>
      
      <motion.div 
        variants={topbarContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-4"
      >
        {/* Theme Toggle Pill Slider */}
        <motion.div variants={topbarItemVariants} className="relative flex items-center bg-gray-100/80 dark:bg-gray-800/80 rounded-full p-1 border border-gray-200 dark:border-gray-700 gap-3">
          <motion.div
            className="absolute rounded-full shadow-sm bg-white dark:bg-gray-600"
            animate={{ 
              x: theme === 'dark' ? 40 : 0 
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ width: '28px', height: '28px' }}
          />
          <button 
            onClick={() => theme === 'light' ? null : toggleTheme()}
            className={`relative z-10 p-1.5 rounded-full transition-colors duration-300 ${theme === 'light' ? 'text-blue-500' : 'text-gray-400 hover:text-gray-500'}`}
          >
            <SunIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => theme === 'dark' ? null : toggleTheme()}
            className={`relative z-10 p-1.5 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-400 hover:text-gray-500'}`}
          >
            <MoonIcon className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Separator */}
        <motion.div variants={topbarItemVariants} className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800" />

        {/* 24-Hour Calculator Clock (Fixed Width to prevent Jitter) */}
        <motion.div variants={topbarItemVariants} className="w-[125px] flex items-center justify-center">
          <span 
            className="text-xl font-bold text-gray-400 dark:text-gray-500 leading-none tracking-widest tabular-nums"
            style={{ fontFamily: 'var(--font-digital)' }}
          >
            {time ? format(time, "HH:mm:ss") : "00:00:00"}
          </span>
        </motion.div>
        
        {/* Separator */}
        <motion.div variants={topbarItemVariants} className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800" />

        {/* Profile Dropdown */}
        <motion.div variants={topbarItemVariants}>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-2 outline-none group">
                <div className="text-right hidden sm:block">
                <p className="text-base font-semibold font-sans text-gray-900 dark:text-white leading-none">{name}</p>
              </div>
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-700 group-hover:border-gray-900 dark:group-hover:border-white group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-all overflow-hidden relative">
                    <div className="absolute inset-0 bg-gray-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {session?.user?.image ? (
                        <Image 
                            src={session.user.image} 
                            alt="Profile" 
                            width={36} 
                            height={36} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        initials
                    )}
                </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl">
                <DropdownMenuLabel className="p-3">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-400 font-medium">{session?.user?.email}</p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                <DropdownMenuItem 
                onClick={async () => {
                    await authClient.signOut();
                    window.location.href = '/';
                }}
                className="flex items-center gap-3 p-3 text-sm font-semibold text-red-500 dark:text-rose-400 rounded-lg hover:bg-red-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer"
                >
                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
      </motion.div>
    </header>
  );
}
