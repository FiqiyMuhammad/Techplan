import type { Metadata } from "next";
import { Inter, Geist, Orbitron } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import MaintenanceProvider from "@/components/providers/MaintenanceProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-digital",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechPlan | Unified Education Planning Platform",
  description: "Next-generation curriculum engineering and automated scheduling platform.",
  icons: {
    icon: "/logoku/logo1/logo-aja.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/gh/mrazvangerry/aspekta@latest/css/aspekta.css" 
        />
      </head>
      <body
        className={`${inter.variable} ${geist.variable} ${orbitron.variable} font-inter antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300 no-scrollbar`}
      >
          <QueryProvider>
            <MaintenanceProvider>
              <SmoothScroll>
                {children}
              </SmoothScroll>
              <Toaster position="top-right" richColors />
            </MaintenanceProvider>
          </QueryProvider>
      </body>
    </html>
  );
}
