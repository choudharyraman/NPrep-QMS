// src/pages/TicketDetailView.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicketStore } from '../lib/ticketStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatTimeAgo } from '../lib/mockData';
import { ArrowLeft, Users2, ThumbsUp, ThumbsDown, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

const StatusStep: React.FC<{ icon: React.ReactNode; label: string; done: boolean; active: boolean }> = ({ icon, label, done, active }) => (
  <div className={`flex flex-col items-center gap-1 flex-1 ${done || active ? '' : 'opacity-40'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${done ? 'bg-emerald-500' : active ? 'bg-[#1ba1f5]' : 'bg-slate-300'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-semibold text-center leading-tight ${active ? 'text-[#1ba1f5]' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

export const TicketDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tickets = useTicketStore();
  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-brand-bg px-8 text-center">
        <p className="text-brand-textMuted font-semibold">Ticket not found</p>
        <button onClick={() => navigate('/my-tickets')} className="mt-4 text-[#1ba1f5] text-sm font-semibold">
          ← Back to My Doubts
        </button>
      </div>
    );
  }

  const steps = [
    { label: 'Submitted', icon: <CheckCircle2 size={16} />, done: true, active: false },
    { label: 'Under Review', icon: <Clock size={16} />, done: ticket.status !== 'pending', active: ticket.status === 'in_progress' },
    { label: 'Answered', icon: <MessageSquare size={16} />, done: ticket.status === 'answered' || ticket.status === 'resolved', active: ticket.status === 'answered' },
    { label: 'Resolved', icon: <CheckCircle2 size={16} />, done: ticket.status === 'resolved', active: ticket.status === 'resolved' },
  ];

  return (
    <div className="flex flex-col bg-brand-bg min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-brand-border px-4 pt-4 pb-3 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#1ba1f5] text-sm font-semibold mb-3 active:opacity-70"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex gap-1.5 mb-1.5 flex-wrap">
              <span className="text-[10px] bg-blue-50 text-[#1ba1f5] px-2 py-0.5 rounded-full font-bold border border-blue-100">
                {ticket.subject}
              </span>
              <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                {ticket.topic}
              </span>
            </div>
            <p className="text-[10px] text-brand-textMuted">{formatTimeAgo(ticket.created_at)}</p>
          </div>
          <StatusBadge status={ticket.status} size="md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Status Timeline */}
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-brand-border p-4">
          <p className="text-[10px] font-bold text-brand-textMuted uppercase tracking-widest mb-3">Status Timeline</p>
          <div className="flex items-start gap-1 relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 z-0 mx-4" />
            {steps.map((step, i) => (
              <StatusStep key={i} {...step} />
            ))}
          </div>
        </div>

        {/* Similar students banner */}
        {ticket.similar_count > 1 && (
          <div className="mx-4 mt-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Users2 size={18} className="text-[#1ba1f5] shrink-0" />
            <p className="text-xs text-[#1ba1f5] font-semibold">
              {ticket.similar_count} other students asked a similar question about {ticket.topic}
            </p>
          </div>
        )}

        {/* Chat thread */}
        <div className="mx-4 mt-4 space-y-4 pb-8">
          {/* Student query bubble */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] text-brand-textMuted font-medium">You</span>
              <div className="w-5 h-5 rounded-full bg-[#1ba1f5] flex items-center justify-center text-[8px] font-bold text-white">PS</div>
            </div>
            <div className="max-w-[85%] bg-[#1ba1f5] text-white rounded-2xl rounded-tr-md p-4 shadow-sm">
              <p className="text-[13px] leading-relaxed">{ticket.text_query}</p>
            </div>
            <span className="text-[9px] text-brand-textMuted">{formatTimeAgo(ticket.created_at)}</span>
          </div>

          {/* Faculty reply or waiting state */}
          {ticket.faculty_reply ? (
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-white">
                  {ticket.faculty_name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'DR'}
                </div>
                <span className="text-[10px] text-brand-textMuted font-medium">
                  {ticket.faculty_name || 'Faculty'}
                </span>
              </div>
              <div className="max-w-[90%] bg-white border border-brand-border rounded-2xl rounded-tl-md p-4 shadow-sm">
                {/* Render newlines and simple markdown-like formatting */}
                <div className="text-[13px] leading-relaxed text-brand-textMain whitespace-pre-wrap">
                  {ticket.faculty_reply.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-bold">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('• ') || line.startsWith('🔑') || line.startsWith('💡') || line.startsWith('🩺') || line.startsWith('📊') || line.startsWith('🔵') || line.startsWith('🟢')) {
                      return <p key={i} className="mt-1">{line}</p>;
                    }
                    return <p key={i} className={line === '' ? 'mt-2' : ''}>{line}</p>;
                  })}
                </div>
              </div>
              <span className="text-[9px] text-brand-textMuted">{formatTimeAgo(ticket.updated_at)}</span>

              {/* Was this helpful? */}
              {ticket.status === 'answered' && (
                <div className="mt-3 bg-white border border-brand-border rounded-2xl p-3 flex items-center gap-3 w-full">
                  <p className="text-xs text-brand-textMuted font-medium flex-1">Was this answer helpful?</p>
                  <button className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                    <ThumbsUp size={12} /> Yes
                  </button>
                  <button className="flex items-center gap-1 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                    <ThumbsDown size={12} /> No
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-start">
              <div className="bg-white border border-brand-border border-dashed rounded-2xl rounded-tl-md p-4 max-w-[85%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-brand-textMuted">Faculty is reviewing...</span>
                </div>
                <p className="text-[11px] text-brand-textMuted/60">
                  You'll get a browser notification when your doubt is answered.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
