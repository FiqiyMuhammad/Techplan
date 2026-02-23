"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  showCloseButton = true
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop: Subtle dark and blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[4px]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl w-full ${maxWidth} relative z-[10000] border border-gray-100 dark:border-gray-800`}
          >
            {title && (
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-aspekta tracking-tight text-gray-900 dark:text-white leading-tight">
                  {title}
                </h3>
                {showCloseButton && (
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {!title && showCloseButton && (
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all z-20"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}

            <div className="relative">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
