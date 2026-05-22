import React, { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { FilterPills } from '../components/ui/FilterPills';
import { ListItemCard } from '../components/ui/ListItemCard';
import { Building2, Award, GraduationCap, Microscope } from 'lucide-react';

export const TestsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('PYQ');

  const testsData = [
    { title: 'NORCET', icon: <Building2 className="text-blue-600 w-7 h-7" />, color: 'bg-slate-100' },
    { title: 'AIIMS Nursing Officer Exams', icon: <Award className="text-blue-600 w-7 h-7" />, color: 'bg-slate-100' },
    { title: 'AIIMS CRE', icon: <Award className="text-indigo-600 w-7 h-7" />, color: 'bg-slate-100' },
    { title: 'CHO Exams', icon: <GraduationCap className="text-green-600 w-7 h-7" />, color: 'bg-slate-100' },
    { title: 'JIPMER', icon: <Microscope className="text-red-600 w-7 h-7" />, color: 'bg-slate-100' },
    { title: 'SGPGI Nursing Officer', icon: <Building2 className="text-blue-800 w-7 h-7" />, color: 'bg-slate-100' },
    { title: 'KGMU Nursing Officer', icon: <Building2 className="text-red-800 w-7 h-7" />, color: 'bg-slate-100' },
  ];

  return (
    <div className="flex flex-col bg-brand-bg min-h-full">
      <TopAppBar title="Tests" />
      
      <div className="sticky top-[64px] z-30 bg-brand-bg pb-2">
        <FilterPills 
          options={['PYQ', 'Daily Test', 'Subject Test', 'Nash']} 
          activeOption={activeTab} 
          onChange={setActiveTab} 
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {testsData.map((item, idx) => (
          <ListItemCard 
            key={idx}
            title={item.title}
            icon={item.icon}
            iconBgColor={item.color}
          />
        ))}
      </div>
    </div>
  );
};
