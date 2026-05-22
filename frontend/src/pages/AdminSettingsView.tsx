import React, { useState } from 'react';
import { Settings, Server, Shield, Activity } from 'lucide-react';

export function AdminSettingsView() {
  const [ingestionEnabled, setIngestionEnabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleIngestion = async () => {
    setIsUpdating(true);
    try {
      // Mock API call to toggle backend ingestion gate
      await new Promise(resolve => setTimeout(resolve, 600));
      setIngestionEnabled(!ingestionEnabled);
    } catch (err) {
      console.error('Failed to toggle ingestion', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="text-rose-400" />
            Admin Settings
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              <Server className="text-rose-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Ingestion Gate</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-lg">
                Controls whether the backend accepts new tickets. Disable this during database migrations or major system maintenance.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className={ingestionEnabled ? "text-emerald-400" : "text-slate-600"} size={20} />
              <div>
                <div className="font-bold text-sm text-white">Traffic Routing</div>
                <div className={`text-xs mt-0.5 ${ingestionEnabled ? "text-emerald-400" : "text-slate-500"}`}>
                  {ingestionEnabled ? "Active - Accepting new tickets" : "Paused - Returning 503 Maintenance"}
                </div>
              </div>
            </div>
            
            {/* Custom Responsive Toggle Switch using em/rem */}
            <button 
              onClick={toggleIngestion}
              disabled={isUpdating}
              className={`relative flex items-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 rounded-full disabled:opacity-50`}
              style={{
                width: '3.5rem',
                height: '2rem',
                backgroundColor: ingestionEnabled ? '#10b981' : '#334155',
                padding: '0.25rem'
              }}
              aria-pressed={ingestionEnabled}
            >
              <span className="sr-only">Toggle Ingestion Gate</span>
              <span
                className={`inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out`}
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  transform: ingestionEnabled ? 'translateX(1.5rem)' : 'translateX(0)'
                }}
              />
            </button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 opacity-60">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <Shield className="text-slate-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Access Control</h2>
              <p className="text-sm text-slate-400 mt-1">
                Manage faculty permissions and API keys.
              </p>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-center text-slate-500 text-sm">
            Configuration locked - contact Super Admin
          </div>
        </section>
      </main>
    </div>
  );
}
