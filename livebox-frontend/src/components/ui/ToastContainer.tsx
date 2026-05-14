import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, Toast } from '@/store/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#81ecff]" />,
    error: <AlertCircle className="w-5 h-5 text-[#ff4d4d]" />,
    info: <Info className="w-5 h-5 text-[#81ecff]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#ffb86c]" />
  };

  const bgColors = {
    success: 'bg-surface-container-low/80 border-[#81ecff]/30 shadow-[0_0_20px_rgba(129,236,255,0.15)]',
    error: 'bg-error-container/20 border-[#ff4d4d]/30 shadow-[0_0_20px_rgba(255,77,77,0.1)]',
    info: 'bg-surface-container-low/80 border-[#81ecff]/30 shadow-[0_0_20px_rgba(129,236,255,0.1)]',
    warning: 'bg-surface-container-low/80 border-[#ffb86c]/30 shadow-[0_0_20px_rgba(255,184,108,0.1)]'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto min-w-[320px] max-w-[420px] backdrop-blur-xl border p-4 rounded-2xl flex items-center gap-4 ${bgColors[toast.type]}`}
    >
      <div className="shrink-0">{icons[toast.type]}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-on-surface leading-tight tracking-tight">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 p-1 rounded-full hover:bg-white/5 text-outline/40 hover:text-on-surface transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
