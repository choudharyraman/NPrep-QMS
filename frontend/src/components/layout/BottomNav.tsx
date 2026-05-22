import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, PlayCircle, FileText, ShoppingCart } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'QBank', icon: BookOpen, path: '/qbank' },
    { name: 'Videos', icon: PlayCircle, path: '/videos' },
    { name: 'Tests', icon: FileText, path: '/tests' },
    { name: 'Buy', icon: ShoppingCart, path: '/buy' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border h-[68px] pb-safe z-40 max-w-md mx-auto">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors duration-200 ${
                isActive ? 'text-brand-navy' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-brand-navy rounded-b-md" />
                )}
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-tight">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
