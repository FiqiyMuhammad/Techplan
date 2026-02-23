"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/fragments/Hero";
import { BentoDemo as Problem } from "@/components/fragments/BentoGrid";
import Integrations from "@/components/fragments/Integrations";
import Instruction from "@/components/fragments/Instruction";
import SoftwareV2 from "@/components/fragments/SoftwareV2";
import FAQ from "@/components/fragments/FAQ";
import Pricing from "@/components/fragments/Pricing";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Instruction />
      <SoftwareV2 />
      <Problem />
      <Integrations />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
