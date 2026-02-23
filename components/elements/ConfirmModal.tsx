"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import Modal from "./Modal";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[420px]"
      showCloseButton={true}
    >
      <div className="flex flex-col items-center text-center">
        {variant === "destructive" && (
          <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-5">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
          </div>
        )}

        <div className="flex flex-col gap-2 mb-8">
          <h3 className="text-2xl font-bold font-aspekta tracking-tight text-gray-900 dark:text-white leading-tight">
            {title}
          </h3>
          {description && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-geist leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="ghost"
          onClick={onClose}
          className="flex-1 rounded-xl h-11 font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          className={`flex-1 rounded-xl h-11 font-bold ${
            variant === "destructive" 
              ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20" 
              : "bg-gray-900 dark:bg-white text-white dark:text-black"
          }`}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
