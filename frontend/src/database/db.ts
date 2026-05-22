import Dexie, { type Table } from 'dexie';

// 1. Define TypeScript Interface matching backend schema
export interface Ticket {
  id: string;             // Client-generated UUID (Primary Key, non-incremental for backend sync)
  student_id: string;     // Student ID related to the ticket
  subject: string;        // Ticket subject
  topic: string;          // Topic of discussion
  status: 'open' | 'in_progress' | 'resolved';
  updated_at: number;     // Unix timestamp (milliseconds) of last edit
  dirty: number;          // Binary flag: 1 if offline creation/edit is pending sync; 0 if synced
  deleted: number;        // Binary flag: 1 if soft-deleted offline (to push to backend); 0 otherwise
}

// 2. Initialize Dexie Database Class
export class QMSDatabase extends Dexie {
  tickets!: Table<Ticket, string>; // Primary key is a string (UUID)

  constructor() {
    super('QMSDatabase');
    
    // Define IndexedDB stores and indices.
    // Specifying id (not ++id) as primary key since UUIDs are generated in the application client-side.
    this.version(1).stores({
      tickets: 'id, student_id, subject, topic, status, updated_at, dirty, deleted'
    });
  }
}

// 3. Export global singleton instance of db
export const db = new QMSDatabase();
