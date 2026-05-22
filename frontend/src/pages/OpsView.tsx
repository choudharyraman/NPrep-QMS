// src/pages/OpsView.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTicketStore } from '../lib/ticketStore';
import { MOCK_ANALYTICS, formatTimeAgo, getOverdueTickets } from '../lib/mockData';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Download,
  LogOut, MessageSquareWarning, BarChart3, Send, UserCheck,
  TrendingUp, TrendingDown, ExternalLink
} from 'lucide-react';

const KPICard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}> = ({ label, value, sub, icon, trend, color = 'text-slate-900' }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">{icon}</div>
      {trend && (
        trend === 'up' ? <TrendingUp size={14} className="text-emerald-500" /> :
        trend === 'down' ? <TrendingDown size={14} className="text-rose-500" /> : null
      )}
    </div>
    <div className={`text-3xl font-bold font-outfit ${color}`}>{value}</div>
    <div className="text-sm text-slate-500 font-medium mt-0.5">{label}</div>
    {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
  </div>
);

export const OpsView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allTickets = useTicketStore();
  const [exportLoading, setExportLoading] = useState(false);
  const [assignModalTicket, setAssignModalTicket] = useState<string | null>(null);

  const stats = MOCK_ANALYTICS.kpis;
  const pending = allTickets.filter(t => t.status === 'pending').length;
  const answeredToday = allTickets.filter(t => t.status === 'answered' || t.status === 'resolved').length;
  const overdue = allTickets.filter(t => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return t.status === 'pending' && new Date(t.created_at).getTime() < cutoff;
  });

  const handleExportCSV = async () => {
    setExportLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const rows = [
      ['ID', 'Student', 'Subject', 'Topic', 'Status', 'Created At', 'Faculty Reply'],
      ...allTickets.map(t => [t.id, t.student_name, t.subject, t.topic, t.status, t.created_at, t.faculty_reply || ''])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nprep-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setExportLoading(false);
  };

  const handleWhatsAppEscalate = (ticket: ReturnType<typeof useTicketStore>[0]) => {
    const msg = encodeURIComponent(
      `[NPrep QMS Escalation]\n\nStudent: ${ticket.student_name}\nSubject: ${ticket.subject} - ${ticket.topic}\nQuery: ${ticket.text_query}\n\nThis ticket has been pending for >24 hours. Please assign a faculty member immediately.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 font-outfit leading-tight">Ops Command Centre</h1>
            <p className="text-[11px] text-slate-400">{user?.name} · {user?.designation}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="flex items-center gap-1.5 text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
          >
            <Download size={15} />
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
          >
            <BarChart3 size={18} />
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Total Tickets"
            value={stats.total_tickets.toLocaleString()}
            sub="All time"
            icon={<MessageSquareWarning size={20} className="text-slate-500" />}
            trend="up"
          />
          <KPICard
            label="Pending Now"
            value={pending}
            sub="Awaiting faculty"
            icon={<Clock size={20} className="text-amber-500" />}
            color="text-amber-600"
          />
          <KPICard
            label="Overdue (>24h)"
            value={overdue.length}
            sub="Need escalation"
            icon={<AlertTriangle size={20} className="text-rose-500" />}
            color={overdue.length > 0 ? 'text-rose-600' : 'text-slate-900'}
            trend={overdue.length > 0 ? 'up' : 'neutral'}
          />
          <KPICard
            label="Resolved Today"
            value={answeredToday}
            sub={`${stats.deflection_rate}% deflection rate`}
            icon={<CheckCircle2 size={20} className="text-emerald-500" />}
            color="text-emerald-600"
            trend="down"
          />
        </div>

        {/* Avg Response Time */}
        <div className="bg-gradient-to-br from-[#0b163f] to-[#1ba1f5] rounded-2xl p-5 text-white flex items-center gap-6">
          <div className="flex-1">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Avg Resolution Time</p>
            <div className="text-4xl font-bold font-outfit">{stats.avg_resolution_hours}h</div>
            <p className="text-blue-200 text-sm mt-1">
              Target: &lt;4h · {stats.avg_resolution_hours <= 4 ? '✅ On track' : '⚠️ Above target'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Deflection Rate</p>
            <div className="text-4xl font-bold font-outfit">{stats.deflection_rate}%</div>
            <p className="text-blue-200 text-sm mt-1">Doubts self-resolved via similar answers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Escalation Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <h2 className="font-bold text-slate-800 text-sm">Escalation Queue</h2>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                {overdue.length} overdue
              </span>
            </div>
            {overdue.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No overdue tickets!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {overdue.map(ticket => (
                  <div key={ticket.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex gap-1.5 mb-1">
                          <span className="text-[10px] bg-blue-50 text-[#1ba1f5] px-2 py-0.5 rounded-full font-bold border border-blue-100">
                            {ticket.subject}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 line-clamp-1">{ticket.text_query}</p>
                        <p className="text-[10px] text-rose-500 font-semibold mt-1">
                          ⏰ {ticket.student_name} · Waiting {formatTimeAgo(ticket.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWhatsAppEscalate(ticket)}
                        className="flex items-center gap-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-all active:scale-95"
                      >
                        <ExternalLink size={12} /> Escalate via WhatsApp
                      </button>
                      <button
                        onClick={() => setAssignModalTicket(ticket.id)}
                        className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        <UserCheck size={12} /> Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Faculty Performance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <UserCheck size={16} className="text-purple-500" />
              <h2 className="font-bold text-slate-800 text-sm">Faculty Performance Today</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolved</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Time</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_ANALYTICS.faculty_performance.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1ba1f5] to-[#0b163f] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {f.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{f.name}</p>
                            <p className="text-[10px] text-slate-400">{f.subjects}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center font-bold text-slate-700">{f.resolved}</td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.avg_time_hours <= 4 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {f.avg_time_hours}h
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Link to Analytics */}
        <button
          onClick={() => navigate('/analytics')}
          className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <BarChart3 size={20} className="text-indigo-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Curriculum Analytics</p>
              <p className="text-xs text-slate-500">View confusion heatmap, topic spikes & trend data</p>
            </div>
          </div>
          <Send size={16} className="text-slate-400 rotate-45" />
        </button>
      </main>
    </div>
  );
};
