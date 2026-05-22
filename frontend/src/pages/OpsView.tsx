// src/pages/OpsView.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTicketStore, ticketStore } from '../lib/ticketStore';
import { MOCK_ANALYTICS, PAYOUT_RATE_PER_TICKET, formatTimeAgo } from '../lib/mockData';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Download,
  LogOut, MessageSquareWarning, BarChart3, Send, UserCheck,
  TrendingUp, TrendingDown, ExternalLink, Users, ShieldAlert,
  IndianRupee
} from 'lucide-react';

const KPICard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}> = ({ label, value, sub, icon, trend, color = 'text-slate-900' }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">{icon}</div>
      {trend && (
        trend === 'up' ? <TrendingUp size={14} className="text-emerald-500" /> :
        trend === 'down' ? <TrendingDown size={14} className="text-rose-500" /> : null
      )}
    </div>
    <div>
      <div className={`text-3xl font-bold font-outfit ${color}`}>{value}</div>
      <div className="text-sm text-slate-500 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  </div>
);

type OpsTab = 'overview' | 'roster' | 'qa';

export const OpsView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allTickets = useTicketStore();
  const [activeTab, setActiveTab] = useState<OpsTab>('overview');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Roster state
  const [roster, setRoster] = useState(MOCK_ANALYTICS.faculty_performance);

  const stats = MOCK_ANALYTICS.kpis;
  const pending = allTickets.filter(t => t.status === 'pending').length;
  const answeredToday = allTickets.filter(t => t.status === 'answered' || t.status === 'resolved').length;
  
  const overdue = allTickets.filter(t => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return t.status === 'pending' && new Date(t.created_at).getTime() < cutoff;
  });

  const disputedTickets = allTickets.filter(t => t.status === 'in_progress' && t.faculty_reply);

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

  const toggleFacultyStatus = (facultyId: string) => {
    setRoster(prev => prev.map(f => 
      f.id === facultyId ? { ...f, status: f.status === 'active' ? 'idle' : 'active' } : f
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-20 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 font-outfit leading-tight">Ops Command Centre</h1>
            <p className="text-[11px] text-slate-400">{user?.name} · {user?.designation}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="flex items-center gap-1.5 text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
          >
            <Download size={15} />
            <span className="hidden sm:inline">{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
            title="Analytics"
          >
            <BarChart3 size={18} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 pt-3 sticky top-[61px] sm:top-[65px] z-10 flex gap-6 overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
          { id: 'roster', label: 'Roster & Payouts', icon: <Users size={16} /> },
          { id: 'qa', label: 'QA / Disputed', icon: <ShieldAlert size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as OpsTab)}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-purple-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

            {/* SLA Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SLA Health */}
              <div className="bg-gradient-to-br from-[#0b163f] to-[#1ba1f5] rounded-2xl p-6 text-white flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-blue-200 mb-4">
                    <Clock size={16} />
                    <span className="text-xs font-semibold uppercase tracking-widest">SLA Health Status</span>
                  </div>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-bold font-outfit">{stats.avg_resolution_hours}h</span>
                    <span className="text-blue-100 text-lg mb-1">Average Response</span>
                  </div>
                  <p className="text-blue-200 text-sm mb-6">
                    Target: &lt;4h · {stats.avg_resolution_hours <= 4 ? '✅ Healthy' : '⚠️ Breaching SLA'}
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Deflection Rate</span>
                    <span className="text-sm font-bold">{stats.deflection_rate}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${stats.deflection_rate}%` }}></div>
                  </div>
                  <p className="text-[10px] text-blue-200 mt-2">Tickets resolved automatically by AI suggestions</p>
                </div>
              </div>

              {/* Escalation Queue */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[320px]">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-500" />
                    <h2 className="font-bold text-slate-800 text-sm">Escalation Queue</h2>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    {overdue.length} Breached
                  </span>
                </div>
                {overdue.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <CheckCircle2 size={32} className="mb-3 opacity-30 text-emerald-500" />
                    <p className="text-sm font-medium">No overdue tickets!</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-2">
                    {overdue.map(ticket => {
                      const ageHours = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60));
                      return (
                        <div key={ticket.id} className="p-3 mb-2 bg-rose-50/50 border border-rose-100 rounded-xl flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-sm font-medium text-slate-800 line-clamp-1">{ticket.text_query}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{ticket.subject} · {ticket.topic}</p>
                            </div>
                            <span className="shrink-0 text-xs font-bold text-rose-600 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                              {ageHours}h pending
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-2 border-t border-rose-100/50">
                            <span className="text-xs font-semibold text-slate-600">{ticket.student_name}</span>
                            <button
                              onClick={() => handleWhatsAppEscalate(ticket)}
                              className="flex items-center gap-1.5 text-[10px] font-bold bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-all shadow-sm"
                            >
                              <ExternalLink size={12} /> Escalate via WA
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
          </div>
        )}

        {/* TAB 2: ROSTER & PAYOUTS */}
        {activeTab === 'roster' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                label="Total Faculty"
                value={roster.length}
                icon={<UserCheck size={20} className="text-purple-500" />}
              />
              <KPICard
                label="Active Now"
                value={roster.filter(f => f.status === 'active').length}
                icon={<Activity size={20} className="text-emerald-500" />}
                color="text-emerald-600"
              />
              <KPICard
                label="Estimated Monthly Payout"
                value={`₹${roster.reduce((sum, f) => sum + (f.resolved * PAYOUT_RATE_PER_TICKET), 0).toLocaleString()}`}
                sub={`@ ₹${PAYOUT_RATE_PER_TICKET}/doubt`}
                icon={<IndianRupee size={20} className="text-indigo-500" />}
                color="text-indigo-600"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Faculty Load Balancing & Payouts</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle status to pause ticket routing to specific faculty.</p>
                </div>
                <button
                  className="flex items-center gap-2 text-xs font-bold text-[#1ba1f5] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <Download size={14} /> Export Payouts
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty Member</th>
                      <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subjects</th>
                      <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Routing Status</th>
                      <th className="text-right px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout Calc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map(f => {
                      const isActive = f.status === 'active';
                      const payout = f.resolved * PAYOUT_RATE_PER_TICKET;
                      
                      return (
                        <tr key={f.id} className={`transition-colors ${isActive ? 'hover:bg-slate-50' : 'bg-slate-50/50'}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isActive ? 'bg-gradient-to-br from-[#1ba1f5] to-[#0b163f]' : 'bg-slate-300'}`}>
                                {f.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className={`font-semibold text-sm ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{f.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                  Avg <span className={f.avg_time_hours <= 4 ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>{f.avg_time_hours}h</span> response
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {f.subjects.split(',').map((s, i) => (
                                <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                  {s.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleFacultyStatus(f.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <p className={`text-[10px] font-bold mt-1 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {isActive ? 'Active' : 'Paused'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-bold text-slate-800 text-base">₹{payout.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{f.resolved} tickets @ ₹{PAYOUT_RATE_PER_TICKET}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QA & DISPUTED */}
        {activeTab === 'qa' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
              <ShieldAlert size={24} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-amber-800">Quality Assurance Queue</h2>
                <p className="text-sm text-amber-700 mt-1">
                  Tickets below are marked as "In Progress" after receiving a faculty reply. This typically happens when a student clicks <strong>"No"</strong> to "Was this answer helpful?". Review these interactions for quality.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {disputedTickets.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                  <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-400 opacity-50" />
                  <p className="font-bold text-slate-700">All Clear!</p>
                  <p className="text-sm mt-1">No disputed or flagged tickets right now.</p>
                </div>
              ) : (
                disputedTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Flagged</span>
                        <span className="text-xs font-semibold text-slate-500">Ticket #{ticket.id.slice(-3)}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{formatTimeAgo(ticket.updated_at)}</span>
                    </div>
                    
                    <div className="p-5 flex flex-col gap-4">
                      {/* Student Question */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                          {ticket.student_name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 mb-1">{ticket.student_name} <span className="font-normal text-slate-500 ml-1">asked:</span></p>
                          <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{ticket.text_query}</p>
                        </div>
                      </div>

                      {/* Faculty Reply */}
                      <div className="flex gap-3 ml-6 md:ml-12 border-l-2 border-indigo-100 pl-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                          {ticket.faculty_name?.split(' ').map(w => w[0]).join('') || 'DR'}
                        </div>
                        <div className="w-full">
                          <p className="text-xs font-bold text-indigo-700 mb-1">{ticket.faculty_name} <span className="font-normal text-slate-500 ml-1">replied:</span></p>
                          <div className="text-sm text-slate-800 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 whitespace-pre-wrap">
                            {ticket.faculty_reply}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                      <p className="text-xs font-semibold text-slate-600 mr-auto">Ops Actions:</p>
                      <button className="text-xs font-bold bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shadow-sm">
                        Reassign Ticket
                      </button>
                      <button className="text-xs font-bold bg-white text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors shadow-sm">
                        Issue Warning
                      </button>
                      <button 
                        onClick={() => ticketStore.updateStatus(ticket.id, 'resolved')}
                        className="text-xs font-bold bg-emerald-500 text-white border border-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                      >
                        Force Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
