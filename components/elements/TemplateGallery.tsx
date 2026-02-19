
"use client";

import { motion } from "framer-motion";
import { Template } from "@/lib/data/templates";

interface TemplateGalleryProps {
  templates: Template[];
  onSelect: (prompt: string) => void;
}

export default function TemplateGallery({ templates, onSelect }: TemplateGalleryProps) {

  const getBackground = (idx: number) => {
    switch (idx) {
      case 0: return "linear-gradient(135deg, #D37323 0%, #984316 100%)";
      case 1: return "radial-gradient(circle at center, #2C4B96 -20%, #0A111C 80%)";
      case 2: return "linear-gradient(135deg, #1C4A37 0%, #0B2F23 100%)";
      default: return "var(--gray-100)";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center px-1">
        <h3 className="text-base font-medium text-gray-400/80">Idea starters</h3>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelect(template.prompt)}
            style={{ background: getBackground(idx) }}
            className="group p-8 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 border border-white/10 flex flex-col h-full relative overflow-hidden"
          >
            {/* Subtle light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-white/20 transition-colors" />
            
            <h4 className="text-lg font-bold text-white mb-3 group-hover:text-white/90 transition-colors font-aspekta tracking-tight relative z-10">
              {template.title}
            </h4>
            <p className="text-sm text-white/80 font-medium leading-relaxed flex-1 relative z-10">
              {template.description}
            </p>
            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end relative z-10">
              <span className="text-[11px] font-bold text-white uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Gunakan Template <span className="text-xs">→</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}

