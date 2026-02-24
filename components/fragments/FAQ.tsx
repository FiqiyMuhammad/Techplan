"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "../common/ScrollReveal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
      mass: 1,
      bounce: 0,
    },
  },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How is data privacy handled for institutional scripts?",
      answer: "All generated scripts run natively within your Google Cloud project. No institutional data ever touches our servers; the AI only processes the technical schema needed to generate the logic, ensuring 100% data residency within your Workspace.",
    },
    {
      question: "Does the curriculum generator support international standards?",
      answer: "Yes. The engine is trained on global pedagogical frameworks including Bloom’s Taxonomy for lesson objectives and specific international standards. It can be tuned via prompt engineering to match specific institutional KPIs.",
    },
    {
      question: "Are the generated Google Apps Scripts optimized for performance?",
      answer: "Absolutely. Our 'Master Architect' protocol enforces batch operations (like setValues()) and minimizes API calls to stay within Google's execution quotas and prevent timeout errors in large-scale deployments.",
    },
    {
      question: "Can the AI handle complex integrations with 3rd-party APIs?",
      answer: "Beyond Google Workspace, the AI excels at building UrlFetchApp logic to bridge TechPlan with any RESTful service, enabling automated synchronization between your spreadsheet and CRM, LMS, or ERP systems.",
    },
    {
      question: "Is the code generated compatible with modern DevOps practices?",
      answer: "The scripts align with Clasp-friendly structures, allowing your technical team to pull the code into local repositories, wrap it in TypeScript, and implement CI/CD pipelines via GitHub Actions.",
    },
    {
      question: "How does TechPlan ensure 'Zero-Configuration' for users?",
      answer: "Every script includes an 'Auto-Database Setup' routine. Upon the first run, the script automatically verifies and creates necessary sheets, headers, and UI elements, meaning users only need to copy-paste.",
    },
  ];

  return (
    <section id="faq" className="w-full bg-white py-16 pb-24">
            <div className="container mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
                {/* Left Side: Sticky Title */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="lg:col-span-4 lg:sticky lg:top-32"
                >
                    <motion.h2 
                        variants={itemVariants}
                        className="text-[1.35rem] md:text-[2rem] leading-[1.15] font-semibold mb-4 font-aspekta tracking-[-0.03em] bg-gradient-to-r from-black from-30% to-[#3A96F6] bg-clip-text text-transparent pb-1"
                    >
                        Technical Architectures
                    </motion.h2>
                    <motion.p 
                        variants={itemVariants}
                        className="text-gray-500 font-geist leading-relaxed mb-6 text-xs md:text-sm"
                    >
                        Everything you need to know about implementing TechPlan in your institution.
                    </motion.p>
                    
                    <motion.button 
                        variants={itemVariants}
                        className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 hover:border-black transition-colors"
                    >
                        Contact Support →
                    </motion.button>
                </motion.div>

                {/* Right Side: Accordion List */}
                <div className="lg:col-span-8 flex flex-col gap-2">
                    {faqs.map((faq, index) => (
                        <ScrollReveal key={index} delay={0.1 * index} direction="left" width="100%">
                            <div 
                                className={`group relative bg-white rounded-[24px] border transition-all duration-500 overflow-hidden ${
                                    openIndex === index 
                                    ? "border-gray-100 shadow-xl shadow-gray-100/80" 
                                    : "border-transparent border-b-gray-50 hover:shadow-lg hover:shadow-gray-100/50 hover:border-gray-200"
                                }`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between py-4 md:py-5 px-5 md:px-7 text-left focus:outline-none bg-white z-20 relative"
                                >
                                    <span className={`text-base md:text-lg font-medium font-aspekta pr-8 transition-colors duration-300 ${
                                        openIndex === index ? "text-blue-600" : "text-gray-900"
                                    }`}>
                                        {faq.question}
                                    </span>
                                    <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-gray-100 bg-white transition-all duration-300 ${
                                        openIndex === index ? "bg-black border-black text-white rotate-45" : "text-gray-400"
                                    }`}>
                                        <svg 
                                            className="w-5 h-5" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </span>
                                </button>
                                
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                            className="relative z-10"
                                        >
                                            <div className="px-5 md:px-7 pb-5 pt-0 text-gray-500 font-geist leading-relaxed text-xs md:text-sm bg-white">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
}

