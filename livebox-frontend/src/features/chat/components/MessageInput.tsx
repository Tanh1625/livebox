import React from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  placeholder: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder
}) => {
  return (
    <footer className="p-6 shrink-0">
      <form
        onSubmit={onSubmit}
        className="bg-surface-container-high rounded-full flex items-center p-2 pl-6 gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-outline-variant/10"
      >
        <button type="button" className="text-outline hover:text-primary transition-colors active:scale-90">
          <span className="material-symbols-outlined">add_circle</span>
        </button>
        <input
          className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50"
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 text-outline hover:text-primary transition-colors active:scale-90">
            <span className="material-symbols-outlined">mood</span>
          </button>
          <button
            type="submit"
            disabled={!value.trim()}
            className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center hover:shadow-[0_0_15px_rgba(129,236,255,0.5)] transition-all active:scale-90 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </form>
    </footer>
  );
};
