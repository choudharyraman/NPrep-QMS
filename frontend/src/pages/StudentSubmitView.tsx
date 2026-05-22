import React, { useState } from 'react';
import { db } from '../database/db';
import { compressImage } from '../utils/imageCompression';
import { CheckCircle, Upload, X } from 'lucide-react';

export function StudentSubmitView() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [query, setQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const compressed = await compressImage(selectedFile, 400);
      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Optimistic UI: save to Dexie instantly
      await db.tickets.add({
        id: crypto.randomUUID(),
        student_id: 'STU-123', // Mock student
        subject,
        topic,
        text_query: query,
        image_url: preview || undefined, // For local demo purposes, just storing object URL or string
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dirty: 1 // Flag for background sync
      });

      setIsSuccess(true);
      
      // Register sync event if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          await (registration as any).sync.register('sync-tickets');
        } catch (err) {
          console.error('Background sync failed to register:', err);
        }
      }
    } catch (err) {
      console.error('Failed to submit ticket', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubject('');
    setTopic('');
    setQuery('');
    setFile(null);
    setPreview(null);
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full translate-y-1/2 scale-150" />
        <CheckCircle className="w-32 h-32 text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] z-10" />
        <h1 className="text-3xl font-bold text-white mb-3 z-10">Submitted!</h1>
        <p className="text-slate-400 mb-8 z-10">Your doubt has been securely queued. Our faculty will respond shortly.</p>
        <button 
          onClick={resetForm}
          className="w-full min-h-[44px] bg-slate-800 text-white font-bold rounded-xl active:scale-95 transition-all z-10 border border-slate-700"
        >
          Submit Another Query
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full min-h-screen bg-slate-950 text-slate-200 p-4 md:p-6 shadow-xl relative">
      <header className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Ask a Doubt</h1>
        <p className="text-sm text-slate-400 mt-1">Get answers from expert faculty.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 flex flex-col h-full">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Subject</label>
          <select 
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-xl px-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
          >
            <option value="" disabled>Select a subject...</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Topic</label>
          <input 
            required
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Thermodynamics, Calculus..."
            className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-xl px-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Your Question</label>
          <textarea 
            required
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="w-full min-h-[120px] bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Attachment (Optional)</label>
          {!preview ? (
            <label className="w-full min-h-[100px] bg-slate-900/50 border border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 hover:border-indigo-500/50 transition-all group">
              <Upload className="text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors" size={24} />
              <span className="text-xs text-slate-500 font-medium group-hover:text-slate-300">Tap to upload image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-2 flex items-center justify-center h-[200px]">
              <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
              <button 
                type="button" 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-rose-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 mt-auto">
          <button 
            type="submit"
            disabled={isSubmitting || !subject || !topic || !query}
            className="w-full min-h-[50px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Query'}
          </button>
        </div>
      </form>
    </div>
  );
}
