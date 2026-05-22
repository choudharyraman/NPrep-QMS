import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

interface TelemetryData {
  topic: string;
  volume: number;
  is_anomaly: boolean;
  subject: string;
}

export function AnalyticsView() {
  const [data, setData] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock fetching from /api/analytics/spikes
    const fetchTelemetry = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        setData([
          { topic: 'Kinematics', volume: 12, is_anomaly: false, subject: 'Physics' },
          { topic: 'Thermodynamics', volume: 85, is_anomaly: true, subject: 'Physics' },
          { topic: 'Calculus', volume: 24, is_anomaly: false, subject: 'Math' },
          { topic: 'Organic Chem', volume: 45, is_anomaly: false, subject: 'Chemistry' },
          { topic: 'Genetics', volume: 18, is_anomaly: false, subject: 'Biology' },
          { topic: 'Electromagnetism', volume: 8, is_anomaly: false, subject: 'Physics' }
        ]);
      } catch (err) {
        console.error('Failed to fetch telemetry', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTelemetry();
  }, []);

  const anomalies = data.filter(d => d.is_anomaly);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isAnomaly = payload[0].payload.is_anomaly;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-slate-300 text-sm">Tickets: <span className="font-bold">{payload[0].value}</span></p>
          {isAnomaly && (
            <p className="text-rose-400 text-xs font-bold mt-2 uppercase flex items-center gap-1">
              <AlertTriangle size={12} /> High Volume Spike
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Dynamic Alert Banner */}
      {anomalies.length > 0 && (
        <div className="w-full bg-rose-600 text-white p-4 font-bold flex flex-col md:flex-row items-center justify-center gap-3 shadow-[0_4px_20px_rgba(225,29,72,0.3)] z-20 relative">
          <div className="flex items-center gap-2">
            <AlertTriangle className="animate-pulse" />
            <span className="uppercase tracking-wider text-sm md:text-base">Curriculum Anomaly Detected</span>
          </div>
          <span className="hidden md:inline px-2 opacity-50">|</span>
          <span className="text-xs md:text-sm bg-black/20 px-3 py-1 rounded-full whitespace-nowrap">
            {anomalies.map(a => a.topic).join(', ')} spike in queries
          </span>
        </div>
      )}

      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-sky-400" />
            Curriculum Telemetry
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Volume (24h)</div>
            <div className="text-3xl font-bold text-white">
              {data.reduce((acc, curr) => acc + curr.volume, 0)}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Anomalies</div>
            <div className={`text-3xl font-bold ${anomalies.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {anomalies.length}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg Resolution</div>
            <div className="text-3xl font-bold text-sky-400">14m</div>
          </div>
        </div>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-indigo-400" size={20} />
            <h2 className="text-lg font-bold text-white">Confusion Heatmap</h2>
          </div>
          
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              Loading telemetry...
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="topic" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickMargin={10}
                    tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                  />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
                  <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.is_anomaly ? '#e11d48' : '#4f46e5'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-400 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              Standard Volume
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-600"></div>
              Spike / Anomaly
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
