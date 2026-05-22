import Dexie, { type Table } from 'dexie';

// Updated to match all fields used by SmartSubmitModal and TicketStore
export type TicketStatus = 'pending' | 'in_progress' | 'answered' | 'resolved';

export interface Ticket {
  id: string;
  student_id: string;
  student_name?: string;
  subject: string;
  topic: string;
  text_query?: string;
  image_url?: string;
  status: TicketStatus;
  faculty_reply?: string;
  faculty_name?: string;
  faculty_id?: string;
  created_at: string;
  updated_at?: string;
  dirty?: number;
  deleted?: number;
  similar_count?: number;
  cluster_id?: string;
}

export class QMSDatabase extends Dexie {
  tickets!: Table<Ticket, string>;

  constructor() {
    super('QMSDatabase');
    this.version(2).stores({
      tickets: 'id, student_id, subject, topic, status, created_at, dirty, deleted, cluster_id, faculty_id'
    });
  }
}

export const db = new QMSDatabase();
