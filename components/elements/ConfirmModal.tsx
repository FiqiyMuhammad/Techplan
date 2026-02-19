"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive"
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-[420px] relative z-10 border border-gray-100 dark:border-gray-800"
          >
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl opacity-50"></div>

            <div className="flex flex-col gap-2 mb-8 mt-2">
              <h3 className="text-2xl font-bold font-aspekta tracking-tighter text-gray-900 dark:text-white">
                {title}
              </h3>
              {description && (
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-geist">
                  {description}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 rounded-2xl h-12 font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {cancelText}
              </Button>
              <Button
                variant={variant}
                onClick={onConfirm}
                className={`flex-1 rounded-2xl h-12 font-bold ${
                  variant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20" : "bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg shadow-gray-900/10"
                }`}
              >
                {confirmText}
              </Button>
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
