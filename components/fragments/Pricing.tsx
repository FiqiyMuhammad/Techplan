"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "../common/SectionHeader";
import { ScrollReveal } from "../common/ScrollReveal";

const plans = [
  {
    name: "Free Plan",
    title: "Free",
    description: "Perfect for individual educators beginning their digital curriculum journey.",
    price: { monthly: 0, yearly: 0 },
    buttonText: "Get Started",
    highlight: false,
    features: [
      "20 AI Generation Credits (one-time)",
      "AI AppScript Generator",
      "AI Curriculum Generator",
      "Access to GPT-4o Mini",
      "Standard Drag-and-Drop Scheduler",
      "Basic AI Prompt Templates",
    ],
  },
  {
    name: "Pro Plan",
    title: "IDR XX.XXX",
    description: "Empowering departments with advanced AI-driven coordination.",
    billing: "Billed monthly",
    price: { monthly: 149000, yearly: 149000 },
    buttonText: "Subscribe Now",
    highlight: true,
    features: [
      "100 AI Generation Credits / mo",
      "AI AppScript Generator",
      "AI Curriculum Generator",
      "Powered by GPT-4o & Claude 3.5",
      "Advanced Conflict Detection Engine",
      "Custom Pedagogical Frameworks",
      "Advanced Usage Analytics",
      "Priority Email Support",
    ],
  },
  {
    name: "Founder Plan",
    title: "IDR XX.XXX",
    description: "The complete infrastructure for large-scale institutional transformation.",
    billing: "Billed monthly",
    price: { monthly: 249000, yearly: 249000 },
    buttonText: "Subscribe Now",
    highlight: false,
    features: [
      "Unlimited AI Generation Credits",
      "AI AppScript Generator",
      "AI Curriculum Generator",
      "Full Access to SOTA Models (Opus/Pro)",
      "Real-time AI Conflict Resolution Hub",
      "Institutional-wide Data Analytics",
      "Advanced Progress Monitoring",
      "White-label Dashboard Branding",
      "Dedicated Onboarding Support",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white pb-24 sm:pb-32 pt-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader 
          title="Invest in Educational Excellence"
          description={[
            "Select the ideal foundation for your institution's digital evolution. From individual classroom optimization to",
            "district-wide AI orchestration, TechPlan provides the infrastructure for next-generation pedagogy."
          ]}
        />

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan, idx) => (
            <ScrollReveal 
              key={plan.name} 
              delay={0.2 * (idx + 1)} 
              width="100%"
            >
              <div
                className={cn(
                  "relative h-full flex flex-col rounded-3xl p-8 ring-1 ring-gray-200 transition-all duration-300 hover:shadow-2xl",
                  plan.highlight
                    ? "text-white ring-0 shadow-[0_20px_50px_-15px_rgba(4,25,49,0.3)] scale-[1.05] z-10 overflow-hidden"
                    : "bg-white text-gray-900"
                )}
                style={plan.highlight ? { 
                  background: "linear-gradient(135deg, #01060D 0%, #041931 50%, #010811 100%)"
                } : {}}
              >
                {plan.highlight && (
                  <>
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    <div className="absolute -top-[10%] -right-[10%] h-[150px] w-[150px] bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-[10%] -left-[10%] h-[150px] w-[200px] bg-[#3A96F6]/10 blur-[90px] rounded-full pointer-events-none" />
                  </>
                )}
                
                <div className="flex flex-col h-full">
                  {/* Header Section */}
                  <div className="min-h-[160px]">
                    <h3 className={cn(
                      "text-2xl font-bold font-aspekta tracking-tighter",
                      plan.highlight ? "text-white" : "text-gray-900"
                    )}>
                      {plan.name}
                    </h3>
                    
                    <div className="mt-4 flex items-baseline gap-x-1">
                      {plan.title !== "Free" && (
                        <span className={cn(
                          "text-xl font-bold font-aspekta",
                          plan.highlight ? "text-white" : "text-gray-900"
                        )}>
                          IDR
                        </span>
                      )}
                      <span className={cn(
                        "text-[2.5rem] font-bold font-aspekta tracking-tighter",
                        plan.highlight ? "text-white" : "text-gray-900"
                      )}>
                        {plan.title === "Free" ? "Free" : plan.title.replace("IDR ", "")}
                      </span>
                      {plan.title !== "Free" && (
                        <span className={cn(
                          "text-lg font-medium opacity-60",
                          plan.highlight ? "text-gray-400" : "text-gray-500"
                        )}>
                          /mo
                        </span>
                      )}
                    </div>

                    {plan.billing && (
                      <p className={cn(
                        "mt-1 text-[10px] uppercase font-bold tracking-widest opacity-60",
                        plan.highlight ? "text-gray-400" : "text-gray-500"
                      )}>
                        {plan.billing}
                      </p>
                    )}

                    <p className={cn(
                      "mt-4 text-sm font-geist font-medium leading-relaxed min-h-[40px]",
                      plan.highlight ? "text-gray-400" : "text-gray-500"
                    )}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Button Section */}
                  <div className="mt-8">
                    <button
                      className={cn(
                          "group relative flex w-full items-center justify-between rounded-full py-2 pl-6 pr-2 text-sm font-bold transition-all duration-300",
                          plan.highlight 
                          ? "bg-white text-black hover:bg-gray-100" 
                          : "bg-black text-white hover:bg-gray-900"
                      )}
                    >
                      <span>{plan.buttonText}</span>
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5",
                        plan.highlight ? "bg-black text-white" : "bg-white text-black"
                      )}>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </button>
                  </div>

                  {/* Features Section */}
                  <div className="mt-10 flex-1 flex flex-col">
                    <p className={cn(
                      "text-xs font-bold font-aspekta tracking-wider uppercase mb-6",
                      plan.highlight ? "text-white/40" : "text-gray-400"
                    )}>
                      What&apos;s Included:
                    </p>
                    <ul
                      role="list"
                      className={cn(
                        "space-y-4 text-[0.875rem] leading-6",
                        plan.highlight ? "text-gray-300" : "text-gray-600"
                      )}
                    >
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-x-3 items-start">
                          <div className={cn(
                            "flex h-5 w-5 flex-none items-center justify-center rounded-full mt-0.5",
                            plan.highlight ? "bg-white/10 text-white" : "bg-blue-50 text-[#3A96F6]"
                          )}>
                             <Check className="h-3 w-3 stroke-[4]" />
                          </div>
                          <span className="font-geist text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

