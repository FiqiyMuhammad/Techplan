"use client";

import Link from "next/link";
import NextImage from "next/image";

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
    Social: [
      { name: "X (Twitter)", href: "#" },
      { name: "LinkedIn", href: "#" },
      { name: "GitHub", href: "#" },
      { name: "Instagram", href: "#" },
    ],
  };

  return (
    <footer className="footer pt-24 pb-12 border-t border-gray-100 bg-[#fafafa]">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-1">
            <div className="footer-logo mb-6 flex items-center gap-2">
               <NextImage 
                 src="/logoku/logo1/logo-full.svg" 
                 alt="TechPlan Logo" 
                 width={140} 
                 height={40} 
                 className="h-8 w-auto object-contain" 
               />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[240px] font-geist">
              The unified workspace for modern education planning and outcome-driven curriculum engineering.
            </p>
          </div>
          
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h5 className="font-bold text-gray-900 mb-6 font-geist text-sm uppercase tracking-widest">{category}</h5>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-geist">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="copyright text-gray-400 text-xs font-medium font-geist uppercase tracking-widest">
            © 2026 TechPlan Inc. All rights reserved.
          </div>
          <div className="flex gap-8">
            <Link href="#" className="text-gray-400 hover:text-black transition-colors text-xs uppercase tracking-widest font-bold">Privacy Policy</Link>
            <Link href="#" className="text-gray-400 hover:text-black transition-colors text-xs uppercase tracking-widest font-bold">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
