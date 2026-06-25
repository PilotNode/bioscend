import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

/**
 * Replaces window.confirm() with a custom modal for Capacitor compatibility.
 * Uses the existing Modal (which becomes a bottom-sheet on mobile).
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const iconColor = variant === 'danger' ? 'text-error' : 'text-warning';
  const iconBg = variant === 'danger' ? 'bg-error/10' : 'bg-warning/10';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-5">
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
          </div>
          <p className="text-gray-300 leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex space-x-3 pt-1">
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
