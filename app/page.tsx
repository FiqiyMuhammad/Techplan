"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/fragments/Hero";
import Integrations from "@/components/fragments/Integrations";
import Problem from "@/components/fragments/Problem";
import Instruction from "@/components/fragments/Instruction";
import SoftwareV2 from "@/components/fragments/SoftwareV2";
import Extension from "@/components/fragments/Extension";
import FAQ from "@/components/fragments/FAQ";
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
      <Extension />
      <FAQ />
      <Footer />
    </main>
  );
}
