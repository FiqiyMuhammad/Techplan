"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        mass: 1,
        bounce: 0,
      }
    },
  };

  const navItems = ["Home", "Features", "Specs", "Pricing", "FAQ"];

  return (
    <>
      <nav className={`navbar fixed top-0 left-0 w-full z-[100] transition-all duration-500 flex items-center border-b ${
        isScrolled 
          ? "h-16 bg-white/80 backdrop-blur-xl border-gray-100 shadow-sm" 
          : "h-20 bg-transparent border-transparent shadow-none"
      }`}>
        <motion.div 
          className="w-full px-6 md:px-16 flex justify-between items-center relative h-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="z-[110]">
            <Link href="/" className="logo flex items-center gap-2">
              <Image 
                src="/logoku/logo1/logo-full.svg" 
                alt="TechPlan Logo" 
                width={160} 
                height={46} 
                className="h-8 md:h-9 w-auto object-contain"
                priority
              />
            </Link>
          </motion.div>
          
          {/* Desktop Nav Links */}
          <motion.ul 
            className="nav-links hidden md:flex list-none gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            variants={containerVariants}
          >
            {navItems.map((item) => (
              <motion.li key={item} variants={itemVariants}>
                <Link 
                  href={`#${item.toLowerCase()}`} 
                  className="text-base font-medium text-gray-500 hover:text-blue-600 transition-all tracking-tight"
                >
                  {item}
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* Desktop Auth */}
          <motion.div 
            className="hidden md:flex items-center gap-6"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Link href="/sign-in" className="text-gray-600 font-medium hover:text-black transition-colors text-base">
                Log In
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="/sign-up" className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm tracking-tight hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-geist shadow-xl shadow-black/10">
                Get Started ➜
              </Link>
            </motion.div>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <motion.div variants={itemVariants} className="md:hidden z-[110]">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-900 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </motion.div>
        </motion.div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[120] md:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[130] shadow-2xl flex flex-col p-8 md:hidden"
            >
              {/* Sidebar Header */}
              <div className="flex justify-between items-center mb-10 pt-2">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Image 
                    src="/logoku/logo1/logo-full.svg" 
                    alt="TechPlan Logo" 
                    width={140} 
                    height={40} 
                    className="h-7 w-auto object-contain"
                  />
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-900 focus:outline-none"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu Links */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <ul className="flex flex-col">
                  {navItems.map((item) => (
                    <li key={item} className="border-b border-gray-50 last:border-none">
                      <Link 
                        href={`#${item.toLowerCase()}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between py-5 text-[1rem] font-normal text-gray-700 hover:text-blue-600 transition-colors group"
                      >
                        {item}
                        <motion.div
                          whileHover={{ x: 3 }}
                          className="text-gray-200 group-hover:text-blue-500 transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </motion.div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sidebar Footer Buttons */}
              <div className="mt-auto pt-6 flex flex-col gap-3">
                <Link 
                  href="/sign-in" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-4 text-gray-900 font-semibold border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  Log In
                </Link>
                <Link 
                  href="/sign-up" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-4 bg-black text-white font-bold rounded-2xl shadow-xl shadow-black/10 transition-all hover:bg-zinc-800 active:scale-[0.98]"
                >
                  Get Started →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
