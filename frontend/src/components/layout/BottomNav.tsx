// src/components/layout/BottomNav.tsx — Updated tabs for student app
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, BookOpen, PlayCircle, FileText } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'My Doubts', icon: MessageSquare, path: '/my-tickets' },
    { name: 'QBank', icon: BookOpen, path: '/qbank' },
    { name: 'Videos', icon: PlayCircle, path: '/videos' },
    { name: 'Tests', icon: FileText, path: '/tests' },
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
                isActive ? 'text-[#1ba1f5]' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 w-8 h-0.5 bg-[#1ba1f5] rounded-b-full" />
                )}
                <item.icon
                  className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={`text-[10px] font-medium tracking-tight transition-all ${isActive ? 'font-bold' : ''}`}>
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
