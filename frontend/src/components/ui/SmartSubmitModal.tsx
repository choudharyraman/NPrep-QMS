// src/components/ui/SmartSubmitModal.tsx — Upgraded with similarity deflection step
import React, { useState, useEffect, useCallback } from 'react';
import { X, Send, Paperclip, CheckCircle, Search, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import { ticketStore } from '../../lib/ticketStore';
import { SUBJECTS, TOPICS_BY_SUBJECT, SimilarAnswer, searchSimilarAnswers } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';

interface SmartSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartSubmitModal: React.FC<SmartSubmitModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'similar' | 'success'>('form');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [query, setQuery] = useState('');
  const [similarAnswers, setSimilarAnswers] = useState<SimilarAnswer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedAnswer, setExpandedAnswer] = useState<string | null>(null);

  // Debounced similarity search as user types
  useEffect(() => {
    if (query.length < 20) {
      setSimilarAnswers([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      await new Promise(r => setTimeout(r, 400)); // simulate API call
      const results = searchSimilarAnswers(query);
      setSimilarAnswers(results);
      setIsSearching(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = async () => {
    if (!query.trim() || !subject) return;

    // If similar answers exist, show deflection step first
    if (similarAnswers.length > 0 && step === 'form') {
      setStep('similar');
      return;
    }

    // Direct submit
    await doSubmit();
  };

  const doSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    ticketStore.add({
      id: crypto.randomUUID(),
      student_id: user?.id || 'stu-001',
      student_name: user?.name || 'Student',
      subject,
      topic: topic || 'General',
      text_query: query,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      similar_count: similarAnswers.length,
      dirty: 1,
    });

    setIsSubmitting(false);
    setStep('success');
    setTimeout(() => {
      resetAndClose();
    }, 2500);
  };

  const resetAndClose = () => {
    setStep('form');
    setSubject('');
    setTopic('');
    setQuery('');
    setSimilarAnswers([]);
    setExpandedAnswer(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-brand-bg flex flex-col" style={{ animation: 'slideUp 0.25s ease-out' }}>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-brand-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0b163f] to-[#1ba1f5] flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <h2 className="text-base font-bold text-brand-textMain font-outfit">Ask a Doubt</h2>
        </div>
        <button
          onClick={resetAndClose}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 transition-all"
        >
          <X className="w-4 h-4 text-brand-textMain" />
        </button>
      </div>

      {/* Success State */}
      {step === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-brand-textMain font-outfit">Doubt Submitted!</h3>
          <p className="text-brand-textMuted text-sm mt-2 leading-relaxed max-w-[260px]">
            Our faculty will answer your question. Avg. response time is <strong>4.2 hours</strong>. You'll get a notification!
          </p>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5 text-left w-full">
            <p className="text-xs text-[#1ba1f5] font-bold uppercase tracking-wide mb-1">Your Question</p>
            <p className="text-sm text-brand-textMain line-clamp-3">{query}</p>
          </div>
        </div>
      )}

      {/* Similar Answers Deflection Step */}
      {step === 'similar' && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-4 pt-4 pb-3 bg-amber-50 border-b border-amber-200">
            <div className="flex items-start gap-2.5">
              <Search size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">We found similar answered questions!</p>
                <p className="text-xs text-amber-700 mt-0.5">Check if any of these already answers your doubt before submitting.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {similarAnswers.map(ans => (
              <div key={ans.id} className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="flex gap-1.5 mb-2">
                    <span className="text-[10px] bg-blue-50 text-[#1ba1f5] px-2 py-0.5 rounded-full font-bold border border-blue-100">{ans.subject}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      {Math.round(ans.similarity * 100)}% match
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-brand-textMain leading-snug">{ans.question}</p>
                  <p className={`text-xs text-brand-textMuted mt-2 leading-relaxed ${expandedAnswer === ans.id ? '' : 'line-clamp-2'}`}>
                    {ans.answer_preview}
                  </p>
                  <button
                    onClick={() => setExpandedAnswer(expandedAnswer === ans.id ? null : ans.id)}
                    className="text-[#1ba1f5] text-xs font-semibold mt-1 flex items-center gap-0.5"
                  >
                    {expandedAnswer === ans.id ? 'Show less' : 'Read more'}
                    <ChevronRight size={12} className={`transition-transform ${expandedAnswer === ans.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                <div className="border-t border-brand-border flex">
                  <button
                    onClick={resetAndClose}
                    className="flex-1 py-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    ✓ This answers my question
                  </button>
                  <div className="w-px bg-brand-border" />
                  <button
                    onClick={doSubmit}
                    className="flex-1 py-3 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Still submit my doubt
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-brand-border">
            <button
              onClick={doSubmit}
              disabled={isSubmitting}
              className="w-full h-11 bg-[#1ba1f5] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Submit Anyway <Send size={14} /></>}
            </button>
          </div>
        </div>
      )}

      {/* Main Form Step */}
      {step === 'form' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Subject + Topic Row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject *</label>
                <select
                  value={subject}
                  onChange={e => { setSubject(e.target.value); setTopic(''); }}
                  className="w-full h-11 px-3 bg-white border border-brand-border rounded-xl text-sm text-brand-textMain focus:outline-none focus:border-[#1ba1f5] focus:ring-1 focus:ring-[#1ba1f5]/20 transition-all appearance-none"
                >
                  <option value="" disabled>Subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Topic *</label>
                <select
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  disabled={!subject}
                  className="w-full h-11 px-3 bg-white border border-brand-border rounded-xl text-sm text-brand-textMain focus:outline-none focus:border-[#1ba1f5] focus:ring-1 focus:ring-[#1ba1f5]/20 transition-all appearance-none disabled:opacity-50"
                >
                  <option value="" disabled>Topic...</option>
                  {subject && TOPICS_BY_SUBJECT[subject]?.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Question input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Your Question *
                {isSearching && <span className="ml-2 text-[#1ba1f5] normal-case font-normal tracking-normal">Searching for similar answers...</span>}
              </label>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Describe your doubt in detail. More detail = faster, better answer..."
                rows={5}
                className="w-full px-4 py-3 bg-white border border-brand-border rounded-xl text-sm text-brand-textMain focus:outline-none focus:border-[#1ba1f5] focus:ring-1 focus:ring-[#1ba1f5]/20 transition-all resize-none placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* Similar answers preview (inline, while typing) */}
            {similarAnswers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Search size={14} className="text-[#1ba1f5]" />
                  <p className="text-xs font-bold text-[#1ba1f5]">
                    {similarAnswers.length} similar answered question{similarAnswers.length > 1 ? 's' : ''} found
                  </p>
                </div>
                {similarAnswers.slice(0, 1).map(ans => (
                  <div key={ans.id} className="bg-white rounded-xl p-3 border border-blue-200">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">{ans.question}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{ans.answer_preview}</p>
                  </div>
                ))}
                <p className="text-[10px] text-[#1ba1f5] mt-2 font-medium">Submit to see all similar answers before posting →</p>
              </div>
            )}

            {/* Attachment */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Attachment (Optional)</label>
              <label className="w-full h-20 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1ba1f5]/40 hover:bg-blue-50/30 transition-all group">
                <Paperclip size={20} className="text-slate-400 group-hover:text-[#1ba1f5] transition-colors mb-1" />
                <span className="text-xs text-slate-400 group-hover:text-[#1ba1f5] font-medium">Tap to attach photo</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Bottom Submit */}
          <div className="p-4 bg-white border-t border-brand-border">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !query.trim() || !subject}
              className="w-full h-12 bg-[#1ba1f5] hover:bg-[#0d8fd8] disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#1ba1f5]/20"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : similarAnswers.length > 0 ? (
                <>View {similarAnswers.length} Similar Answers First <ChevronRight size={16} /></>
              ) : (
                <>Submit Doubt <Send size={14} /></>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
