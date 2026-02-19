
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  CircleStackIcon, 
  ArrowPathIcon,
  CheckBadgeIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import { addCredits } from "@/lib/actions/user-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TopupPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleTopup = async (amount: number) => {
    setIsProcessing(true);
    try {
      const res = await addCredits(amount);
      if (res.success) {
        toast.success(`Simulasi berhasil! +${amount} Kredit ditambahkan.`);
        router.refresh();
      }
    } catch (error) {
      toast.error("Gagal melakukan simulasi top-up");
    } finally {
      setIsProcessing(false);
    }
  };

  const packages = [
    { name: "Starter Kit", credits: 100, price: "Simulation Only", color: "blue" },
    { name: "Power Pack", credits: 500, price: "Simulation Only", color: "emerald" },
    { name: "Unlimited (Meta)", credits: 1000, price: "Simulation Only", color: "purple" },
  ];

  return (
    <div className="min-h-screen p-8 pt-24 max-w-5xl mx-auto space-y-12">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-bold font-aspekta tracking-tighter text-gray-900 dark:text-white">
          Credit Top-Up Simulator
        </h1>
        <p className="text-gray-500 font-medium font-geist">
          Halaman ini digunakan untuk menguji sistem kredit AI tanpa melakukan pembayaran asli.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg, idx) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
            style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-${pkg.color}-500/5 blur-3xl rounded-full group-hover:bg-${pkg.color}-500/10 transition-colors`} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className={`w-12 h-12 rounded-lg bg-${pkg.color}-50 dark:bg-${pkg.color}-900/20 flex items-center justify-center mb-6`}>
                 <CircleStackIcon className={`w-6 h-6 text-${pkg.color}-600`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{pkg.name}</h3>
              <p className="text-sm font-medium text-gray-400 mb-6">{pkg.price}</p>
              
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tighter">{pkg.credits}</span>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">Credits</span>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                    Bisa digunakan untuk Curriculum
                 </div>
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                    Bisa digunakan untuk AppScript
                 </div>
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                    Instant activation
                 </div>
              </div>

              <Button 
                onClick={() => handleTopup(pkg.credits)}
                disabled={isProcessing}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 h-14 rounded-xl font-bold transition-all active:scale-95"
              >
                {isProcessing ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Simulasikan Top-Up"}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-8 flex items-center gap-6" style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
           <BoltIcon className="w-7 h-7 text-white" />
        </div>
        <div>
           <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">Butuh lebih banyak kredit?</h4>
           <p className="text-sm font-medium text-blue-700/70 dark:text-blue-300/60 leading-relaxed">
             Sistem ini sedang dalam tahap simulasi. Kredit yang Anda tambahkan di sini akan langsung masuk ke database 
             dan bisa digunakan untuk mencoba fitur AI Tedu selengkap mungkin.
           </p>
        </div>
      </div>
    </div>
  );
}
