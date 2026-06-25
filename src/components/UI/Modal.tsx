import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * On mobile (< md breakpoint): renders as a bottom sheet that slides up.
 * On desktop (≥ md breakpoint): renders as a centered dialog.
 *
 * The bottom sheet pattern is native to iOS/Android and feels natural in Capacitor.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'md:max-w-md',
    md: 'md:max-w-lg',
    lg: 'md:max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in"
        onClick={onClose}
      />

      {/* ── Mobile: Bottom Sheet ── */}
      <div
        className={`
          relative mt-auto md:mt-0 md:m-4
          bg-surface-elevated
          rounded-t-3xl md:rounded-2xl
          border-t border-surface-raised md:border
          w-full ${sizeClasses[size]}
          animate-sheet-up md:animate-slide-up
          max-h-[92vh] flex flex-col
          safe-area-pb
        `}
      >
        {/* Drag Handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-surface-overlay rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 md:py-4 flex-shrink-0 border-b border-surface-raised/60">
          <h3 className="text-base md:text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-raised rounded-lg transition-colors touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;