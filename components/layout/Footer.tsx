"use client";

import Link from "next/link";
import NextImage from "next/image";
import { motion, Variants } from "framer-motion";

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#solution" },
      { name: "Integrations", href: "#integrations" },
      { name: "Schedules", href: "#instruction" },
      { name: "Pricing", href: "#pricing" },
    ],
    Company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Compliance", href: "#specs" },
    ],
    Resources: [
      { name: "Support Center", href: "#faq" },
      { name: "LMS Integration", href: "#" },
      { name: "University Portal", href: "#" },
      { name: "Mobile App", href: "#extension" },
    ],
  };

  const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
        duration: 0.8, 
        ease: premiumEase
      },
    },
  };

  const slideRight: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: premiumEase
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
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 mb-16"
        >
          {/* Logo & Description Column */}
          <motion.div variants={columnVariants} className="col-span-2 lg:col-span-1 flex flex-col">
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
              The unified workspace for modern education planning and outcome-driven curriculum engineering.
            </motion.p>
          </motion.div>
          
          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div 
              key={category} 
              variants={columnVariants}
              className="flex flex-col"
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
