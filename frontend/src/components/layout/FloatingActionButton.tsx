import React from 'react';
import { MessageCircleQuestion } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-24 right-4 w-14 h-14 bg-brand-blue rounded-full shadow-[0_8px_16px_rgba(27,161,245,0.4)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform z-40"
      aria-label="Ask a Question"
    >
      <MessageCircleQuestion className="w-7 h-7" />
    </button>
  );
};
