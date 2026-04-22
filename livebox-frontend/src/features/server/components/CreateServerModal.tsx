import React, { useEffect, useState } from 'react';

export interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const CreateServerModal: React.FC<CreateServerModalProps> = ({ isOpen, onClose, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-400 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-lg"
        onClick={onClose}
        aria-label="Close modal by clicking outside"
      />
      <div 
        className={`w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-slate-900/5 flex flex-col relative z-10 overflow-hidden transform transition-all duration-300 ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
      >
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />
        
        <div className="p-6 pb-0 flex justify-end items-center relative">
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200"
          >
            Close
          </button>
        </div>
        <div className="px-8 flex flex-col items-center">
          <h2 className="font-extrabold text-3xl mb-1 text-center tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent pb-1">
            Create your workspace
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};
