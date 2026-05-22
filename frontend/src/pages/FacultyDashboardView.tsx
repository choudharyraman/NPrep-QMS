import React, { useState, useEffect } from 'react';
import { db, Ticket } from '../database/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle2, Search, Inbox, AlertCircle } from 'lucide-react';

export function FacultyDashboardView() {
  const tickets = useLiveQuery(() => db.tickets.where('status').notEqual('resolved').toArray(), []);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Example "clustering" logic: group by subject and topic
  const groupedTickets = tickets?.reduce((acc, ticket) => {
    const key = `${ticket.subject} - ${ticket.topic}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>) || {};

  const handleResolveAll = async (key: string) => {
    const cluster = groupedTickets[key];
    if (!cluster) return;

    try {
      const updates = cluster.map(t => db.tickets.update(t.id, { status: 'resolved', dirty: 1 }));
      await Promise.all(updates);
      
      // Request sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          await (registration as any).sync.register('sync-tickets');
        } catch (err) {
          console.error('Background sync failed to register:', err);
        }
      }
    } catch (err) {
      console.error('Failed to resolve all', err);
    }
  };

  const handleResolveSingle = async (id: string) => {
    await db.tickets.update(id, { status: 'resolved', dirty: 1 });
  };

  const selectedTicket = tickets?.find(t => t.id === selectedTicketId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Inbox className="text-indigo-400" />
            Faculty Inbox
          </h1>
          <div className="bg-slate-800 px-3 py-1.5 rounded-full text-xs font-bold text-slate-300">
            {tickets?.length || 0} Pending
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-73px)]">
        
        {/* LEFT PANE: Clustered Inbox */}
        <section className={`md:col-span-4 flex flex-col gap-4 overflow-y-auto ${selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search subjects, topics..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-6">
            {Object.entries(groupedTickets).map(([clusterKey, clusterTickets]) => (
              <div key={clusterKey} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-850 p-3 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">{clusterKey}</h3>
                  <button 
                    onClick={() => handleResolveAll(clusterKey)}
                    className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    RESOLVE ALL ({clusterTickets.length})
                  </button>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {clusterTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full text-left p-3 hover:bg-slate-800/50 transition-colors ${selectedTicketId === ticket.id ? 'bg-indigo-900/20 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-slate-500">{ticket.student_id}</span>
                        <span className="text-[10px] text-slate-500">{new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2">{ticket.text_query}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedTickets).length === 0 && (
              <div className="text-center py-10 px-4 text-slate-500">
                <Inbox size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Inbox is empty</p>
                <p className="text-xs mt-1">All student doubts have been resolved!</p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANE: Ticket Detail */}
        <section className={`md:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col ${!selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
          {selectedTicket ? (
            <>
              <div className="p-4 md:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-850">
                <div>
                  <button 
                    onClick={() => setSelectedTicketId(null)}
                    className="md:hidden text-indigo-400 text-sm font-bold mb-4 flex items-center gap-1"
                  >
                    ← Back to Inbox
                  </button>
                  <div className="flex gap-2 items-center mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">{selectedTicket.subject}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">{selectedTicket.topic}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-2">Ticket from {selectedTicket.student_id}</h2>
                  <p className="text-xs text-slate-500 mt-1">Submitted at {new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
                
                <button 
                  onClick={() => {
                    handleResolveSingle(selectedTicket.id);
                    setSelectedTicketId(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-all min-h-[44px]"
                >
                  <CheckCircle2 size={18} />
                  Mark Resolved
                </button>
              </div>
              
              <div className="p-4 md:p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Query</h3>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 text-sm whitespace-pre-wrap">
                    {selectedTicket.text_query}
                  </div>
                </div>

                {selectedTicket.image_url && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attachment</h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 inline-block">
                      <img src={selectedTicket.image_url} alt="Attached by student" className="max-w-full rounded-lg max-h-[400px] object-contain" />
                    </div>
                  </div>
                )}
                
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3 items-start">
                  <AlertCircle className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-300">AI Context Analysis</h4>
                    <p className="text-xs text-indigo-200/70 mt-1">
                      This query is similar to 3 other questions asked today in {selectedTicket.topic}. 
                      Consider addressing this concept in the next live session.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <Inbox size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a ticket</p>
              <p className="text-sm mt-1">Choose a student query from the left to view details</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
