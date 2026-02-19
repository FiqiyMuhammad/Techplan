"use client";

import { useSidebarStore } from "@/store/useSidebarStore";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Topbar from "@/components/dashboard/layout/Topbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DashboardFooter } from "@/components/dashboard/layout/DashboardFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();
  
  return (
    <ThemeProvider>
      <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300 relative overflow-x-hidden w-full">
        {/* Sublte Global Gradient Backdrop - Fixed & Overflow Hidden to prevent scroll leaks */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-20 w-full h-full">
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gray-100 dark:bg-blue-900/10 blur-[150px] rounded-full translate-x-1/4 translate-y-1/4"></div>
        </div>

        <Sidebar />
        <div 
          className={`flex flex-col transition-all duration-300 relative z-10 min-h-screen w-full ${isCollapsed ? 'pl-20' : 'pl-64'}`}
        >
          <Topbar />
          <main className="flex-1 w-full pt-16 bg-[radial-gradient(at_0%_0%,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_20%,rgba(243,244,246,1)_100%)] dark:bg-[radial-gradient(at_0%_0%,rgba(17,24,39,1)_0%,rgba(17,24,39,1)_20%,rgba(3,7,18,1)_100%)] transition-colors duration-500 relative">
            <div className="min-h-[calc(100vh-64px)] flex flex-col relative z-10">
              <div className="flex-1">
                {children}
              </div>
              <DashboardFooter />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}


