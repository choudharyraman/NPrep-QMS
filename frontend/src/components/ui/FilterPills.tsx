import React from 'react';

interface FilterPillsProps {
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({ options, activeOption, onChange }) => {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar px-4 py-2">
      <div className="flex space-x-2">
        {options.map((option) => {
          const isActive = activeOption === option;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-semibold transition-all min-h-[36px] ${
                isActive
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-[#f1f5f9] text-brand-textMuted hover:bg-[#e2e8f0]'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
