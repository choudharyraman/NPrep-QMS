// src/pages/HomeView.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTicketStore } from '../lib/ticketStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatTimeAgo, SUBJECTS } from '../lib/mockData';
import { Bell, ChevronRight, BookOpen, Microscope, Pill, Brain, Stethoscope, Activity, FlaskConical, Heart, Baby, Ribbon } from 'lucide-react';

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  'Anatomy': <Stethoscope size={20} className="text-orange-500" />,
  'Physiology': <Activity size={20} className="text-red-500" />,
  'Biochemistry': <FlaskConical size={20} className="text-purple-500" />,
  'Pharmacology': <Pill size={20} className="text-blue-500" />,
  'Pathology': <Microscope size={20} className="text-rose-500" />,
  'Microbiology': <Microscope size={20} className="text-green-500" />,
  'Community Health Nursing': <Heart size={20} className="text-pink-500" />,
  'Medical-Surgical Nursing': <BookOpen size={20} className="text-indigo-500" />,
  'Pediatric Nursing': <Baby size={20} className="text-yellow-500" />,
  'OB/GYN Nursing': <Ribbon size={20} className="text-fuchsia-500" />,
};

const SUBJECT_BG: Record<string, string> = {
  'Anatomy': 'bg-orange-50',
  'Physiology': 'bg-red-50',
  'Biochemistry': 'bg-purple-50',
  'Pharmacology': 'bg-blue-50',
  'Pathology': 'bg-rose-50',
  'Microbiology': 'bg-green-50',
  'Community Health Nursing': 'bg-pink-50',
  'Medical-Surgical Nursing': 'bg-indigo-50',
  'Pediatric Nursing': 'bg-yellow-50',
  'OB/GYN Nursing': 'bg-fuchsia-50',
};

export const HomeView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allTickets = useTicketStore();

  const myTickets = allTickets.filter(t => t.student_id === user?.id).slice(0, 5);
  const pendingCount = myTickets.filter(t => t.status === 'pending').length;
  const answeredCount = myTickets.filter(t => t.status === 'answered').length;
  const totalCount = allTickets.filter(t => t.student_id === user?.id).length;

  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <div className="flex flex-col bg-brand-bg min-h-full">
      {/* Top App Bar */}
      <div className="bg-white border-b border-brand-border px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-20">
        <div>
          <p className="text-[11px] text-brand-textMuted font-medium uppercase tracking-widest">
            {user?.batch || 'NPrep Student'}
          </p>
          <h1 className="text-xl font-bold text-brand-textMain font-outfit">
            Hey, {firstName}! 👋
          </h1>
        </div>
        <button className="relative p-2 rounded-full bg-slate-100 active:scale-95 transition-transform">
          <Bell size={20} className="text-brand-textMain" />
          {answeredCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#1ba1f5] rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Hero Banner */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0b163f] to-[#1ba1f5] p-5 relative">
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute right-4 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-8" />
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Got a Doubt?</p>
          <h2 className="text-white text-xl font-bold font-outfit leading-tight">
            Ask our experts.<br />Get answers fast.
          </h2>
          <p className="text-blue-200/80 text-xs mt-2 mb-4">Avg. response time: <span className="text-white font-bold">4.2 hours</span></p>
          <button
            onClick={() => navigate('/my-tickets')}
            className="bg-white text-[#1ba1f5] text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform w-fit"
          >
            My Doubts <ChevronRight size={14} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
          {[
            { label: 'Total Doubts', value: totalCount, color: 'text-brand-textMain' },
            { label: 'Pending', value: pendingCount, color: 'text-amber-600' },
            { label: 'Answered', value: answeredCount, color: 'text-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-3 border border-brand-border text-center shadow-sm">
              <div className={`text-2xl font-bold font-outfit ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-brand-textMuted font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Doubts */}
        <div className="mx-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-brand-textMain">Recent Doubts</h3>
            <button
              onClick={() => navigate('/my-tickets')}
              className="text-xs text-[#1ba1f5] font-semibold flex items-center gap-0.5"
            >
              See all <ChevronRight size={12} />
            </button>
          </div>

          {myTickets.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-brand-border">
              <Brain size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-brand-textMuted text-sm font-medium">No doubts yet</p>
              <p className="text-brand-textMuted/60 text-xs mt-1">Tap the ✦ button to ask your first question</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myTickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => navigate(`/my-tickets/${ticket.id}`)}
                  className="w-full text-left bg-white rounded-2xl p-4 border border-brand-border shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[10px] bg-blue-50 text-[#1ba1f5] px-2 py-0.5 rounded-full font-semibold border border-blue-100">
                        {ticket.subject}
                      </span>
                      <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                        {ticket.topic}
                      </span>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="text-sm text-brand-textMain font-medium line-clamp-2 leading-snug">
                    {ticket.text_query}
                  </p>
                  <p className="text-[10px] text-brand-textMuted mt-2">{formatTimeAgo(ticket.created_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Browse Subjects */}
        <div className="mx-4 mt-6">
          <h3 className="text-sm font-bold text-brand-textMain mb-3">Browse Subjects</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {SUBJECTS.slice(0, 8).map(subject => (
              <button
                key={subject}
                className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-brand-border shadow-sm active:scale-[0.97] transition-transform text-left"
              >
                <div className={`w-9 h-9 rounded-xl ${SUBJECT_BG[subject] || 'bg-slate-50'} flex items-center justify-center shrink-0`}>
                  {SUBJECT_ICONS[subject] || <BookOpen size={20} className="text-slate-500" />}
                </div>
                <span className="text-xs font-semibold text-brand-textMain leading-tight">{subject}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
