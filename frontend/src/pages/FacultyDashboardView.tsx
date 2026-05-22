// src/pages/FacultyDashboardView.tsx — Full Rebuild
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTicketStore, ticketStore } from '../lib/ticketStore';
import { MOCK_CLUSTERS, MockCluster, formatTimeAgo } from '../lib/mockData';
import { StatusBadge } from '../components/ui/StatusBadge';
import { notifyStudentReply } from '../lib/notifications';
import {
  Inbox, Search, AlertTriangle, CheckCircle2, Send,
  LogOut, BarChart3, ChevronRight, Users2, Zap, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FacultyDashboardView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allTickets = useTicketStore();
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentClusterId, setSentClusterId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnomaly, setFilterAnomaly] = useState(false);

  // Merge cluster data with live ticket counts
  const clusters = MOCK_CLUSTERS.filter(c => {
    const clusterTickets = allTickets.filter(t => t.cluster_id === c.cluster_id && (t.status === 'pending' || t.status === 'in_progress'));
    return clusterTickets.length > 0;
  }).filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.topic.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
  }).filter(c => !filterAnomaly || c.is_anomaly);

  const selectedCluster = clusters.find(c => c.cluster_id === selectedClusterId);
  const selectedClusterTickets = selectedCluster
    ? allTickets.filter(t => t.cluster_id === selectedCluster.cluster_id && (t.status === 'pending' || t.status === 'in_progress'))
    : [];

  const representativeTicket = selectedClusterTickets[0];
  const pendingTotal = allTickets.filter(t => t.status === 'pending').length;

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedCluster || !user) return;
    setIsSending(true);

    await new Promise(r => setTimeout(r, 800));

    // Update all tickets in cluster
    const ticketIds = selectedClusterTickets.map(t => t.id);
    ticketStore.bulkAddReply(ticketIds, replyText, user.name, user.id);

    // Fire browser notification simulating push
    notifyStudentReply(selectedCluster.topic, user.name);

    setSentClusterId(selectedCluster.cluster_id);
    setReplyText('');
    setIsSending(false);

    // Deselect after 2s
    setTimeout(() => {
      setSentClusterId(null);
      setSelectedClusterId(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0b163f] to-[#1ba1f5] flex items-center justify-center">
            <Inbox size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 font-outfit leading-tight">Faculty Inbox</h1>
            <p className="text-[11px] text-slate-400">{user?.name} · {user?.designation}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${pendingTotal > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {pendingTotal} Pending
          </span>
          <button
            onClick={() => navigate('/analytics')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
            title="Analytics"
          >
            <BarChart3 size={18} />
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Anomaly Alert */}
      {MOCK_CLUSTERS.some(c => c.is_anomaly) && (
        <div className="bg-rose-600 text-white px-6 py-2.5 flex items-center gap-3">
          <AlertTriangle size={16} className="animate-pulse shrink-0" />
          <p className="text-sm font-semibold">
            High-volume spike detected: {MOCK_CLUSTERS.filter(c => c.is_anomaly).map(c => c.topic).join(' · ')}
          </p>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-73px)]">
        {/* LEFT PANE — Cluster List */}
        <aside className={`${selectedClusterId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] border-r border-slate-200 bg-white overflow-y-auto shrink-0`}>
          {/* Search + Filters */}
          <div className="p-4 border-b border-slate-100 space-y-3 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1ba1f5] focus:ring-1 focus:ring-[#1ba1f5]/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterAnomaly(false)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-all ${!filterAnomaly ? 'bg-[#1ba1f5] text-white border-[#1ba1f5]' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
              >
                All Clusters
              </button>
              <button
                onClick={() => setFilterAnomaly(true)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1 ${filterAnomaly ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
              >
                <Zap size={11} /> Spikes Only
              </button>
            </div>
          </div>

          {/* Cluster Cards */}
          <div className="flex-1 p-3 space-y-2">
            {clusters.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Inbox size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">All caught up!</p>
              </div>
            )}
            {clusters.map(cluster => {
              const liveTickets = allTickets.filter(t => t.cluster_id === cluster.cluster_id && (t.status === 'pending' || t.status === 'in_progress'));
              const isSelected = selectedClusterId === cluster.cluster_id;
              const isSent = sentClusterId === cluster.cluster_id;
              return (
                <button
                  key={cluster.cluster_id}
                  onClick={() => { setSelectedClusterId(cluster.cluster_id); setReplyText(''); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#1ba1f5] bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[10px] bg-blue-50 text-[#1ba1f5] px-2 py-0.5 rounded-full font-bold border border-blue-100">
                        {cluster.subject}
                      </span>
                      {cluster.is_anomaly && (
                        <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold border border-rose-200 flex items-center gap-0.5">
                          <Zap size={8} /> Spike
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                      {liveTickets.length}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                    {cluster.representative_question}
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-slate-400">{cluster.topic} · {formatTimeAgo(cluster.created_at)}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Users2 size={10} /> {cluster.ticket_count} total
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT PANE — Reply Panel */}
        <main className={`${!selectedClusterId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50 overflow-hidden`}>
          {selectedCluster && representativeTicket ? (
            <>
              {/* Panel Header */}
              <div className="bg-white border-b border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <button
                      onClick={() => setSelectedClusterId(null)}
                      className="md:hidden flex items-center gap-1 text-[#1ba1f5] text-sm font-semibold mb-3"
                    >
                      <X size={14} /> Close
                    </button>
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-xs bg-blue-50 text-[#1ba1f5] px-2.5 py-1 rounded-full font-bold border border-blue-100">
                        {selectedCluster.subject}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold border border-slate-200">
                        {selectedCluster.topic}
                      </span>
                      {selectedCluster.is_anomaly && (
                        <span className="text-xs bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-bold border border-rose-200 flex items-center gap-1">
                          <AlertTriangle size={11} /> High Volume
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 font-outfit">
                      {selectedCluster.representative_question}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedClusterTickets.length} students currently asking this · {selectedCluster.ticket_count} total across all time
                    </p>
                  </div>
                </div>

                {/* AI Context Card */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <Zap size={18} className="text-[#1ba1f5] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#0b163f]">AI Context: Cluster Summary</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {selectedCluster.ticket_count} students have asked about <strong>{selectedCluster.topic}</strong> in the last 24h.
                      {selectedCluster.is_anomaly && ' This is a significant spike — consider addressing it in the next live session.'}
                      {' '}A single comprehensive reply will resolve all {selectedClusterTickets.length} active tickets simultaneously.
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Queries Panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Active Questions in This Cluster ({selectedClusterTickets.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedClusterTickets.map(ticket => (
                      <div key={ticket.id} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {ticket.student_name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'ST'}
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{ticket.student_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={ticket.status} />
                            <span className="text-[10px] text-slate-400">{formatTimeAgo(ticket.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{ticket.text_query}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reply Editor (bottom, sticky) */}
              <div className="bg-white border-t border-slate-200 p-6">
                {sentClusterId === selectedCluster.cluster_id ? (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <CheckCircle2 size={20} />
                    <div>
                      <p className="font-bold text-sm">Reply sent successfully!</p>
                      <p className="text-xs text-emerald-600/80 mt-0.5">
                        {selectedClusterTickets.length} students notified. Browser push notification fired.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-700">Your Reply</h3>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Will be sent to {selectedClusterTickets.length} student{selectedClusterTickets.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your answer here. Be thorough — this will resolve all similar questions in this cluster..."
                      rows={5}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#1ba1f5] focus:ring-2 focus:ring-[#1ba1f5]/20 transition-all resize-none placeholder:text-slate-400"
                    />
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSending}
                        className="flex-1 h-11 bg-[#1ba1f5] hover:bg-[#0d8fd8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#1ba1f5]/20"
                      >
                        {isSending ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send size={16} />
                            Send Reply to All {selectedClusterTickets.length} Students
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 select-none">
              <Inbox size={64} className="mb-4 opacity-10" />
              <p className="text-lg font-semibold">Select a cluster</p>
              <p className="text-sm mt-1 opacity-70">Choose a student question cluster from the left to reply</p>
              <button
                onClick={() => navigate('/analytics')}
                className="mt-6 flex items-center gap-2 text-sm text-[#1ba1f5] font-semibold"
              >
                <BarChart3 size={16} /> View Analytics <ChevronRight size={14} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
