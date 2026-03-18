import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantClasses = {
    primary: 'btn-primary',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[var(--charcoal)]">
              {title}
            </h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 text-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-muted mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary flex-1 py-3 order-2 sm:order-1"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`${variantClasses[variant]} flex-1 py-3 order-1 sm:order-2`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
