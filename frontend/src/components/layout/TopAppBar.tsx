import React from 'react';
import { Search } from 'lucide-react';

interface TopAppBarProps {
  title: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title }) => {
  return (
    <div className="sticky top-0 z-40 bg-brand-bg px-4 py-4 flex justify-between items-center w-full">
      <h1 className="text-2xl font-bold text-brand-textMain font-outfit tracking-tight">
        {title}
      </h1>
      <button className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors active:bg-slate-200">
        <Search className="w-6 h-6 text-brand-textMain" />
      </button>
    </div>
  );
};
