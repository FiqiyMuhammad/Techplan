"use client";

import Link from "next/link";
import NextImage from "next/image";

export function DashboardFooter() {
  const menuItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Schedule', href: '/dashboard/schedule' },
    { name: 'Curriculum', href: '/dashboard/curriculum' },
    { name: 'My Files', href: '/dashboard/resources' },
    { name: 'Brainstorm', href: '/workflow/builder' },
    { name: 'AppScript', href: '/dashboard/appscript-builder' },
  ];

  return (
    <footer 
      className="mx-3 mb-3 pt-20 pb-12 px-10 rounded-xl bg-credits-gradient border border-white/10 shadow-2xl relative z-10 overflow-hidden"
      style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      {/* Massive TECHPLAN Watermark Background */}
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0">
        <h2 className="text-[16vw] font-black font-aspekta text-white/5 leading-none tracking-tighter uppercase whitespace-nowrap">
          TechPlan
        </h2>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <div className="font-bold text-xl font-aspekta flex items-center gap-3 text-white tracking-tight">
              <NextImage 
                src="/logoku/logo-putih.svg" 
                alt="TechPlan Logo" 
                width={180} 
                height={50} 
                className="h-11 w-auto object-contain" 
              />
            </div>
            <p className="text-blue-200/60 text-sm leading-relaxed max-w-sm font-medium">
              The unified workspace for modern education planning and outcome-driven curriculum engineering.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 space-y-4">
            <h5 className="text-[10px] font-bold text-blue-300/40 uppercase tracking-[0.2em]">Platform</h5>
            <ul className="space-y-3">
              {menuItems.slice(0, 3).map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm font-semibold text-white/70 hover:text-blue-400 transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 space-y-4">
            <h5 className="text-[10px] font-bold text-blue-300/40 uppercase tracking-[0.2em]">Tools</h5>
            <ul className="space-y-3">
              {menuItems.slice(3).map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm font-semibold text-white/70 hover:text-blue-400 transition-all">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-2 space-y-4 hidden md:block">
            <h5 className="text-[10px] font-bold text-blue-300/40 uppercase tracking-[0.2em]">Support</h5>
            <div className="flex flex-col gap-3">
              <Link href="mailto:hello@techplan.com" className="text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors leading-none">
                hello@techplan.com
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
