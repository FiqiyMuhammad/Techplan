"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How does TechPlan handle scheduling conflicts?",
      answer: "Our automated engine uses a proprietary conflict-resolution algorithm that analyzes teacher availability, room capacity, and student prerequisites to find the optimal path in seconds.",
    },
    {
      question: "Can we integrate with our existing LMS like Moodle or Canvas?",
      answer: "Absolutely. TechPlan is fully LTI compliant, allowing seamless integration with all major Learning Management Systems and student information databases.",
    },
    {
      question: "Is training provided for faculty members?",
      answer: "Yes, our University plan includes personalized onboarding sessions, a dedicated account manager, and 24/7 technical documentation access for all staff members.",
    },
    {
      question: "Is our institutional data secure on your platform?",
      answer: "Security is our top priority. We use enterprise-grade encryption and offer role-based access controls (RBAC) to ensure that sensitive curriculum and student data are always protected.",
    },
  ];

  return (
    <section id="faq" className="faq py-32 bg-white relative overflow-hidden">
        {/* Modern Minimalist Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-50/50 via-white to-white -z-10"></div>
        
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
                {/* Left Side: Sticky Title */}
                <div className="lg:col-span-4 lg:sticky lg:top-32">
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-6 block bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100/50">
                        / Support
                    </span>
                    <h2 className="text-[2.5rem] leading-[1.1] font-bold mb-6 font-aspekta tracking-tight text-gray-900">
                        Common <br /> 
                        <span className="text-gray-400">Queries</span>
                    </h2>
                    <p className="text-gray-500 font-geist leading-relaxed mb-8">
                        Everything you need to know about implementing TechPlan in your institution.
                    </p>
                    
                    <button className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 hover:border-black transition-colors">
                        Contact Support →
                    </button>
                </div>

                {/* Right Side: Accordion List */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`group relative bg-white rounded-[24px] border transition-all duration-500 overflow-hidden ${
                                openIndex === index 
                                ? "border-gray-100 shadow-xl shadow-gray-100/80" 
                                : "border-transparent border-b-gray-50 hover:shadow-lg hover:shadow-gray-100/50 hover:border-gray-200"
                            }`}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none bg-white z-20 relative"
                            >
                                <span className={`text-xl font-medium font-aspekta pr-8 transition-colors duration-300 ${
                                    openIndex === index ? "text-blue-600" : "text-gray-900"
                                }`}>
                                    {faq.question}
                                </span>
                                <span className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-gray-100 bg-white transition-all duration-300 ${
                                    openIndex === index ? "bg-black border-black text-white rotate-45" : "text-gray-400 group-hover:border-black group-hover:text-black"
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
                                        <div className="p-8 pt-0 pl-8 md:pl-8 pr-12 text-gray-500 font-geist leading-relaxed text-lg bg-white pb-8">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
  );
}
