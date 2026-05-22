// src/lib/ticketStore.ts
// In-memory reactive store for tickets (shared between student and faculty views)
// In production this would be Dexie + backend sync

import { MOCK_TICKETS, MockTicket, TicketStatus } from './mockData';

// Mutable copy of tickets in memory
let _tickets: MockTicket[] = [...MOCK_TICKETS];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach(l => l());
}

export const ticketStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getAll(): MockTicket[] {
    return [..._tickets];
  },

  getById(id: string): MockTicket | undefined {
    return _tickets.find(t => t.id === id);
  },

  getByStudent(studentId: string): MockTicket[] {
    return _tickets.filter(t => t.student_id === studentId);
  },

  add(ticket: MockTicket): void {
    _tickets = [ticket, ..._tickets];
    notify();
  },

  update(id: string, patch: Partial<MockTicket>): void {
    _tickets = _tickets.map(t => t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t);
    notify();
  },

  updateStatus(id: string, status: TicketStatus): void {
    ticketStore.update(id, { status });
  },

  addReply(ticketId: string, reply: string, facultyName: string, facultyId: string): void {
    ticketStore.update(ticketId, {
      status: 'answered',
      faculty_reply: reply,
      faculty_name: facultyName,
      faculty_id: facultyId,
    });
  },

  bulkAddReply(ticketIds: string[], reply: string, facultyName: string, facultyId: string): void {
    ticketIds.forEach(id => ticketStore.addReply(id, reply, facultyName, facultyId));
  },
};

// Hook to use ticket store reactively
import { useState, useEffect } from 'react';

export function useTicketStore() {
  const [tickets, setTickets] = useState<MockTicket[]>(ticketStore.getAll());

  useEffect(() => {
    setTickets(ticketStore.getAll());
    const unsub = ticketStore.subscribe(() => {
      setTickets(ticketStore.getAll());
    });
    return unsub;
  }, []);

  return tickets;
}
