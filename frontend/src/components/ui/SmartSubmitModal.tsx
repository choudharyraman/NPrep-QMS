import React, { useState } from 'react';
import { X, Send, Paperclip, CheckCircle } from 'lucide-react';
import { db } from '../../database/db';
import { compressImage } from '../../utils/imageCompression';

interface SmartSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartSubmitModal: React.FC<SmartSubmitModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setIsSubmitting(true);
    try {
      await db.tickets.add({
        id: crypto.randomUUID(),
        subject,
        topic: 'General Query',
        text_query: query,
        status: 'pending',
        dirty: 1,
        created_at: new Date().toISOString(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setQuery('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-brand-bg flex flex-col animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-brand-border">
        <h2 className="text-lg font-bold text-brand-textMain">Ask a Question</h2>
        <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all">
          <X className="w-5 h-5 text-brand-textMain" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f4f6fb]">
        {isSuccess ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h3 className="text-xl font-bold text-brand-textMain">Ticket Submitted!</h3>
            <p className="text-brand-textMuted text-center">We will notify you when an answer is ready.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] self-start">
              <p className="text-[14px] text-brand-textMain">
                Hi! What doubt are you facing today? Provide as much detail as possible, and you can even attach a photo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      {!isSuccess && (
        <div className="p-4 bg-white border-t border-brand-border pb-safe">
          <div className="flex items-center space-x-2">
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-100 text-[13px] font-semibold text-brand-textMain rounded-full px-3 py-2 outline-none border-none"
            >
              <option>Anatomy</option>
              <option>Physiology</option>
              <option>Nursing</option>
              <option>General</option>
            </select>
            
            <div className="flex-1 flex items-center bg-slate-100 rounded-full px-4 py-2">
              <input 
                type="text" 
                placeholder="Type your doubt..." 
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-brand-textMain placeholder-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button className="p-1">
                <Paperclip className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !query.trim()}
              className="p-3 bg-brand-blue rounded-full text-white shadow-sm disabled:opacity-50 disabled:bg-slate-300 transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
