import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ListItemCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  progress?: { current: number; total: number };
  onClick?: () => void;
}

export const ListItemCard: React.FC<ListItemCardProps> = ({
  title,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-100',
  progress,
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-brand-card mx-4 my-2 p-4 rounded-2xl flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-brand-border active:scale-[0.98] transition-transform cursor-pointer min-h-[80px]"
    >
      {/* Icon Area */}
      {icon && (
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 mr-4 ${iconBgColor}`}>
          {icon}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 min-w-0 pr-2">
        <h3 className="text-[15px] font-bold text-brand-textMain leading-tight truncate">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-[12px] text-brand-textMuted mt-1">
            {subtitle}
          </p>
        )}

        {/* Progress Bar Area */}
        {progress && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="flex-1 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-blue rounded-full" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-brand-textMuted shrink-0">
              {progress.current}/{progress.total}
            </span>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="shrink-0">
        <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
      </div>
    </div>
  );
};
