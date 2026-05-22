// src/pages/AnalyticsView.tsx — Upgraded with real mock data, filters, drill-down
import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  CartesianGrid, LineChart, Line, Area, AreaChart
} from 'recharts';
import { MOCK_ANALYTICS, formatTimeAgo } from '../lib/mockData';
import { BarChart3, AlertTriangle, TrendingUp, ArrowLeft, LogOut, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTicketStore } from '../lib/ticketStore';

type TimeFilter = '7d' | '30d' | 'all';
type SubjectFilter = string | 'all';

export function AnalyticsView() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const allTickets = useTicketStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [drillTopic, setDrillTopic] = useState<string | null>(null);

  const data = MOCK_ANALYTICS.topic_volumes.filter(d =>
    subjectFilter === 'all' || d.subject === subjectFilter
  );

  const anomalies = data.filter(d => d.is_anomaly);
  const subjects = Array.from(new Set(MOCK_ANALYTICS.topic_volumes.map(d => d.subject)));

  const liveStats = {
    total: allTickets.length,
    pending: allTickets.filter(t => t.status === 'pending').length,
    answered: allTickets.filter(t => t.status === 'answered' || t.status === 'resolved').length,
    avgHours: MOCK_ANALYTICS.kpis.avg_resolution_hours,
  };

  const drillTopicData = drillTopic
    ? MOCK_ANALYTICS.topic_volumes.find(d => d.topic === drillTopic)
    : null;

  const drillTickets = drillTopic
    ? allTickets.filter(t => t.topic.toLowerCase().includes(drillTopic.split(' ')[0].toLowerCase())).slice(0, 4)
    : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const isAnomaly = payload[0].payload.is_anomaly;
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-sm">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          <p className="text-slate-600">Tickets: <span className="font-bold text-slate-900">{payload[0].value}</span></p>
          <p className="text-slate-400 text-xs">{payload[0].payload.subject}</p>
          {isAnomaly && (
            <p className="text-rose-600 text-xs font-bold mt-1.5 flex items-center gap-1">
              <AlertTriangle size={11} /> High Volume Spike
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Anomaly Banner */}
      {anomalies.length > 0 && (
        <div className="bg-rose-600 text-white px-6 py-2.5 flex items-center gap-3 z-20">
          <AlertTriangle size={16} className="animate-pulse shrink-0" />
          <p className="text-sm font-semibold">
            🚨 Anomalies: {anomalies.map(a => a.topic).join(' · ')} — students are confused!
          </p>
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 font-outfit">Curriculum Analytics</h1>
            <p className="text-[11px] text-slate-400">Confusion heatmap & topic trends</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Tickets', value: liveStats.total, color: 'text-slate-900', sub: 'All time' },
            { label: 'Pending', value: liveStats.pending, color: 'text-amber-600', sub: 'Awaiting reply' },
            { label: 'Answered', value: liveStats.answered, color: 'text-emerald-600', sub: 'Resolved' },
            { label: 'Avg Resolution', value: `${liveStats.avgHours}h`, color: 'text-[#1ba1f5]', sub: 'Target < 4h' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className={`text-3xl font-bold font-outfit ${kpi.color}`}>{kpi.value}</div>
              <div className="text-sm text-slate-600 font-medium">{kpi.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Time Filter */}
          <div className="flex gap-2">
            {([['7d', 'Last 7 Days'], ['30d', 'Last 30 Days'], ['all', 'All Time']] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setTimeFilter(v)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  timeFilter === v ? 'bg-[#1ba1f5] text-white border-[#1ba1f5]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#1ba1f5]/40'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Subject Filter */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setSubjectFilter('all')}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${subjectFilter === 'all' ? 'bg-[#0b163f] text-white border-[#0b163f]' : 'bg-white text-slate-500 border-slate-200'}`}
            >
              All Subjects
            </button>
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${subjectFilter === s ? 'bg-[#0b163f] text-white border-[#0b163f]' : 'bg-white text-slate-500 border-slate-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Confusion Heatmap */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-indigo-500" />
              <h2 className="text-base font-bold text-slate-800 font-outfit">Confusion Heatmap</h2>
              <span className="text-xs text-slate-400 ml-auto">Click a bar to drill down</span>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}
                  onClick={(d) => d?.activePayload && setDrillTopic(d.activePayload[0]?.payload?.topic)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="topic"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickMargin={8}
                    angle={-30}
                    textAnchor="end"
                    tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="volume" radius={[6, 6, 0, 0]} cursor="pointer">
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.is_anomaly ? '#e11d48' : drillTopic === entry.topic ? '#0b163f' : '#1ba1f5'}
                        opacity={drillTopic && drillTopic !== entry.topic ? 0.4 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 justify-center">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1ba1f5] inline-block" /> Normal</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-600 inline-block" /> Anomaly</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0b163f] inline-block" /> Selected</span>
            </div>
          </div>

          {/* Drill-Down / Daily Trend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
            {drillTopicData ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm font-outfit">{drillTopicData.topic}</h3>
                    <p className="text-xs text-slate-400">{drillTopicData.subject}</p>
                  </div>
                  <button onClick={() => setDrillTopic(null)} className="p-1 bg-slate-100 rounded-lg">
                    <X size={14} className="text-slate-500" />
                  </button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900">{drillTopicData.volume}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Tickets</div>
                  </div>
                  {drillTopicData.is_anomaly && (
                    <div className="flex-1 bg-rose-50 rounded-xl p-3 text-center border border-rose-200">
                      <div className="text-2xl font-bold text-rose-600">⚠️</div>
                      <div className="text-[10px] text-rose-600 font-medium">Anomaly</div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Sample Questions</p>
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {drillTickets.length === 0 ? (
                    <p className="text-xs text-slate-400">No live tickets for this topic</p>
                  ) : (
                    drillTickets.map(t => (
                      <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                        <p className="text-xs text-slate-700 font-medium line-clamp-2">{t.text_query}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{t.student_name} · {formatTimeAgo(t.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={16} className="text-slate-500" />
                  <h3 className="font-bold text-slate-800 text-sm font-outfit">7-Day Trend</h3>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={MOCK_ANALYTICS.daily_trend}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1ba1f5" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#1ba1f5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      <Area type="monotone" dataKey="tickets" stroke="#1ba1f5" strokeWidth={2} fill="url(#areaGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">Click any bar to see drill-down →</p>
              </>
            )}
          </div>
        </div>

        {/* Faculty Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm font-outfit">Faculty Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Faculty', 'Tickets Resolved', 'Avg Time', 'Subjects', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_ANALYTICS.faculty_performance.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1ba1f5] to-[#0b163f] flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {f.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold text-slate-800">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-700">{f.resolved}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.avg_time_hours <= 4 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {f.avg_time_hours}h
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{f.subjects}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${f.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
