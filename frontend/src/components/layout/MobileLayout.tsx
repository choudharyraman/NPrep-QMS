import React, { useState } from 'react';
import { BottomNav } from './BottomNav';
import { FloatingActionButton } from './FloatingActionButton';
import { SmartSubmitModal } from '../ui/SmartSubmitModal';

export const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full bg-[#f4f6fb] flex justify-center">
      {/* Mobile Constraint Wrapper */}
      <div className="w-full max-w-md bg-brand-bg min-h-[100dvh] relative shadow-2xl overflow-x-hidden flex flex-col">
        
        {/* Main Content Area */}
        <main className="flex-1 pb-[68px] overflow-y-auto">
          {children}
        </main>

        <BottomNav />
        <FloatingActionButton onClick={() => setIsSubmitModalOpen(true)} />
        
        {/* Smart Submit Overlay Modal */}
        <SmartSubmitModal 
          isOpen={isSubmitModalOpen} 
          onClose={() => setIsSubmitModalOpen(false)} 
        />
      </div>
    </div>
  );
};
