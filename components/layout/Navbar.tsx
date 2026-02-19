"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar fixed top-0 left-0 w-full z-[100] transition-all duration-500 flex items-center border-b ${
      isScrolled 
        ? "h-16 bg-white/80 backdrop-blur-xl border-gray-100 shadow-sm" 
        : "h-20 bg-transparent border-transparent shadow-none"
    }`}>
      <div className="w-full px-8 md:px-16 flex justify-between items-center relative h-full">
        <Link href="/" className="logo flex items-center gap-2 z-50">
          <Image 
            src="/logoku/logo1/logo-full.svg" 
            alt="TechPlan Logo" 
            width={180} 
            height={52} 
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        
        {/* Nav Links - Absolutely Centered */}
        <ul className="nav-links hidden md:flex list-none gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <li><Link href="#home" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-all tracking-tight">Home</Link></li>
          <li><Link href="#solution" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-all tracking-tight">Features</Link></li>
          <li><Link href="#specs" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-all tracking-tight">Specs</Link></li>
          <li><Link href="#pricing" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-all tracking-tight">Pricing</Link></li>
          <li><Link href="#faq" className="text-base font-medium text-gray-500 hover:text-blue-600 transition-all tracking-tight">FAQ</Link></li>
        </ul>

        <div className="nav-auth flex items-center gap-6 z-50">
          <Link href="/sign-in" className="text-gray-600 font-medium hover:text-black transition-colors text-base">
            Log In
          </Link>
          <Link href="/sign-up" className="bg-black text-white px-7 py-3 rounded-full font-bold text-base tracking-tight hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-geist shadow-xl shadow-black/10">
            Get Started ➜
          </Link>
        </div>
      </div>
    </nav>
  );
}
