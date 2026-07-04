'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="relative w-full max-h-[85vh] md:max-w-lg md:max-h-[90vh] glass-surface rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden shadow-2xl z-10"
          >
            {/* iOS Bottom Sheet Drag Handle */}
            <div className="md:hidden w-9 h-1 bg-white/20 rounded-full mx-auto my-3" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-border-neutral">
              <h2 className="text-lg font-bold text-text-primary">{title}</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/4 border border-border-neutral text-text-secondary hover:text-text-primary hover:bg-white/8 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
