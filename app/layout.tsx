import type { Metadata } from "next";
import { Inter, Geist, Orbitron, Ubuntu } from "next/font/google";
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

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechPlan | Unified Education Planning Platform",
  description: "Next-generation curriculum engineering and automated scheduling platform.",
  icons: {
    icon: "/logoku/logo1/logo-aja.svg",
  },
  openGraph: {
    title: "TechPlan | Unified Education Planning Platform",
    description: "Next-generation curriculum engineering and automated scheduling platform.",
    url: "https://tedu-sigma.vercel.app",
    siteName: "TechPlan",
    images: [
      {
        url: "/og-img.png",
        width: 1200,
        height: 630,
        alt: "TechPlan Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechPlan | Unified Education Planning Platform",
    description: "Next-generation curriculum engineering and automated scheduling platform.",
    images: ["/og-img.png"],
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
        className={`${inter.variable} ${geist.variable} ${orbitron.variable} ${ubuntu.variable} font-inter antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300 no-scrollbar`}
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
