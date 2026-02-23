"use client";

import React from 'react';
import Modal from './Modal';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-lg"
    >
      <div className="text-gray-600 dark:text-gray-300 font-geist leading-relaxed text-sm">
        {children}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold text-xs hover:shadow-lg transition-all active:scale-95"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};
