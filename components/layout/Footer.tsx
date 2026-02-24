"use client";

import Link from "next/link";
import NextImage from "next/image";
import { motion, Variants } from "framer-motion";

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "AI Orchestration", href: "#instruction" },
      { name: "Integrations", href: "#integrations" },
      { name: "Pricing", href: "#pricing" },
    ],
    Solutions: [
      { name: "Curriculum Design", href: "#features" },
      { name: "AppScript Builder", href: "#specs" },
      { name: "Workflow Automation", href: "#instruction" },
      { name: "Schedule", href: "#integrations" },
    ],
    Contact: [
      { name: "+6281809885289", href: "https://wa.me/6281809885289" },
      { name: "muhammadfiqiy99@gmail.com", href: "mailto:muhammadfiqiy99@gmail.com" },
    ],
  };


  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const slideUp: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
        bounce: 0,
      },
    },
  };

  const slideRight: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
        bounce: 0,
      },
    },
  };

  const columnVariants: Variants = {
    visible: {
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  return (
    <footer className="footer pt-16 pb-10 border-t border-gray-100 bg-[#fafafa]">
      <div className="container mx-auto px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16"
        >
          {/* Logo & Description Column */}
          <motion.div variants={columnVariants} className="md:col-span-4 lg:col-span-5 flex flex-col">
            <motion.div variants={slideRight} className="footer-logo mb-6 flex items-center gap-2">
               <NextImage 
                 src="/logoku/logo1/logo-full.svg" 
                 alt="TechPlan Logo" 
                 width={160} 
                 height={46} 
                 className="h-9 w-auto object-contain" 
               />
            </motion.div>
            <motion.p variants={slideRight} className="text-gray-500 text-base leading-relaxed max-w-[280px] font-geist">
              The AI-first operating system for educational excellence. We help institutions move from manual complexity to automated, outcome-driven engineering.
            </motion.p>
          </motion.div>
          
          {/* Link Columns - Grouped together */}
          <div className="md:col-span-8 lg:col-span-7 flex flex-row flex-nowrap justify-between md:justify-end gap-x-8 md:gap-x-12 lg:gap-x-20 overflow-x-auto no-scrollbar">
            {Object.entries(footerLinks).map(([category, links]) => (
              <motion.div 
                key={category} 
                variants={columnVariants}
                className="flex flex-col min-w-[140px]"
              >
                <motion.h5 
                  variants={slideUp} 
                  className="font-bold text-gray-900 mb-6 font-geist text-sm uppercase tracking-widest"
                >
                  {category}
                </motion.h5>
                <ul className="flex flex-col gap-4">
                  {links.map((link) => (
                    <motion.li key={link.name} variants={slideUp}>
                      <Link href={link.href} className="text-gray-500 hover:text-blue-600 transition-colors text-base font-geist">
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="copyright text-gray-400 text-xs font-medium font-geist uppercase tracking-widest">
            © 2026 TechPlan Inc. All rights reserved.
          </div>
          <div className="flex gap-8">
            <Link href="#" className="text-gray-400 hover:text-black transition-colors text-xs uppercase tracking-widest font-bold">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
