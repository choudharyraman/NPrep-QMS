import React, { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { FilterPills } from '../components/ui/FilterPills';
import { ListItemCard } from '../components/ui/ListItemCard';
import { Book, Stethoscope, HeartPulse, Brain, Bone } from 'lucide-react';

export const QBankView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const qbankData = [
    { title: 'Fundamental of Nursing [Edition 5]', current: 1, total: 156, icon: <Book className="text-blue-500 w-7 h-7" />, color: 'bg-blue-100' },
    { title: 'Nursing Informatics & Technology [Edition 5]', current: 0, total: 34, icon: <Stethoscope className="text-indigo-500 w-7 h-7" />, color: 'bg-indigo-100' },
    { title: 'Fundamental of Nursing', current: 0, total: 125, icon: <Book className="text-blue-500 w-7 h-7" />, color: 'bg-blue-100' },
    { title: 'Psychology [Edition 5]', current: 0, total: 48, icon: <Brain className="text-pink-500 w-7 h-7" />, color: 'bg-pink-100' },
    { title: 'Anatomy [Edition 5]', current: 0, total: 70, icon: <Bone className="text-orange-500 w-7 h-7" />, color: 'bg-orange-100' },
    { title: 'Physiology [Edition 5]', current: 0, total: 64, icon: <HeartPulse className="text-red-500 w-7 h-7" />, color: 'bg-red-100' },
  ];

  return (
    <div className="flex flex-col bg-brand-bg min-h-full">
      <TopAppBar title="Question Bank" />
      
      <div className="sticky top-[64px] z-30 bg-brand-bg pb-2">
        <FilterPills 
          options={['All', 'Saved QBank']} 
          activeOption={activeTab} 
          onChange={setActiveTab} 
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {qbankData.map((item, idx) => (
          <ListItemCard 
            key={idx}
            title={item.title}
            icon={item.icon}
            iconBgColor={item.color}
            progress={{ current: item.current, total: item.total }}
          />
        ))}
      </div>
    </div>
  );
};
