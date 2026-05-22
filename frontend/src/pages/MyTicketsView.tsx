// src/pages/MyTicketsView.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTicketStore } from '../lib/ticketStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatTimeAgo, TicketStatus } from '../lib/mockData';
import { Search, MessageSquarePlus, ChevronRight, Users2 } from 'lucide-react';

const FILTERS: { label: string; value: TicketStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Answered', value: 'answered' },
  { label: 'Resolved', value: 'resolved' },
];

export const MyTicketsView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allTickets = useTicketStore();
  const [activeFilter, setActiveFilter] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const myTickets = allTickets.filter(t => t.student_id === user?.id);
  const filtered = myTickets
    .filter(t => activeFilter === 'all' || t.status === activeFilter)
    .filter(t => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return t.text_query.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.topic.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const answeredCount = myTickets.filter(t => t.status === 'answered').length;

  return (
    <div className="flex flex-col bg-brand-bg min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-brand-border px-4 pt-4 pb-3 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-brand-textMain font-outfit">My Doubts</h1>
          {answeredCount > 0 && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-full">
              {answeredCount} answered
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search your doubts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1ba1f5] focus:ring-1 focus:ring-[#1ba1f5]/30 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                activeFilter === f.value
                  ? 'bg-[#1ba1f5] text-white border-[#1ba1f5]'
                  : 'bg-white text-brand-textMuted border-brand-border hover:border-[#1ba1f5]/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
            <MessageSquarePlus size={48} className="text-slate-200 mb-4" />
            <p className="text-brand-textMuted font-semibold text-base">No doubts yet</p>
            <p className="text-brand-textMuted/60 text-sm mt-1">
              {activeFilter !== 'all' ? 'No tickets with this status' : 'Tap ✦ to submit your first doubt'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {filtered.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => navigate(`/my-tickets/${ticket.id}`)}
                className="w-full text-left px-4 py-4 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-1.5 flex-wrap flex-1 min-w-0">
                    <span className="shrink-0 text-[10px] bg-blue-50 text-[#1ba1f5] px-2 py-0.5 rounded-full font-bold border border-blue-100">
                      {ticket.subject}
                    </span>
                    <span className="shrink-0 text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                      {ticket.topic}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <StatusBadge status={ticket.status} />
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                </div>

                <p className="text-sm text-brand-textMain font-medium line-clamp-2 leading-snug">
                  {ticket.text_query}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-brand-textMuted">{formatTimeAgo(ticket.created_at)}</span>
                  {ticket.similar_count > 1 && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Users2 size={11} />
                      {ticket.similar_count} students asked this
                    </span>
                  )}
                </div>

                {ticket.status === 'answered' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                    <p className="text-xs text-emerald-700 font-medium line-clamp-1">
                      📝 {ticket.faculty_name}: {ticket.faculty_reply?.substring(0, 80)}...
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
