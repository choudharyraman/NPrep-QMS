import React from 'react';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopAppBarProps {
  title: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-40 bg-brand-bg px-4 py-4 flex justify-between items-center w-full shadow-sm">
      <h1 className="text-2xl font-bold text-brand-textMain font-outfit tracking-tight">
        {title}
      </h1>
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors active:bg-slate-200">
          <Search className="w-5 h-5 text-brand-textMain" />
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 -mr-2 rounded-full hover:bg-red-50 transition-colors active:bg-red-100 text-slate-400 hover:text-red-500"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
