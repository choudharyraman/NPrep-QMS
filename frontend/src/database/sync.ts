import { db, type Ticket } from './db';

export type SyncState = 'idle' | 'syncing' | 'error' | 'success';

export class SyncManager {
  private static isSyncing = false;
  private static listeners: ((state: SyncState, message?: string) => void)[] = [];

  // 1. Subscribe to Sync State Changes
  public static subscribe(listener: (state: SyncState, message?: string) => void) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static emit(state: SyncState, message?: string) {
    this.listeners.forEach(l => l(state, message));
  }

  // 2. Network Status Helper
  public static isOnline(): boolean {
    return navigator.onLine;
  }

  // 3. Storage of Sync Timestamps
  public static getLastPulledAt(): number {
    const val = localStorage.getItem('qms_last_pulled_at');
    return val ? parseInt(val, 10) : 0;
  }

  public static setLastPulledAt(timestamp: number) {
    localStorage.setItem('qms_last_pulled_at', timestamp.toString());
  }

  // Reset sync timestamp (useful for diagnostic force syncs)
  public static resetSyncTimestamp() {
    localStorage.removeItem('qms_last_pulled_at');
  }

  // 4. Main Synchronization Cycle
  public static async sync(): Promise<void> {
    if (this.isSyncing) return;
    
    if (!this.isOnline()) {
      this.emit('idle', 'Offline - Sync suspended');
      return;
    }

    this.isSyncing = true;
    this.emit('syncing', 'Synchronizing data...');

    try {
      // Step A: Pull changes from backend and reconcile locally
      await this.pull();

      // Step B: Push local offline changes to backend
      await this.push();

      this.emit('success', 'Synchronization completed');
    } catch (err: any) {
      console.error('[SyncManager] Error during sync cycle:', err);
      this.emit('error', err.message || 'Sync failed');
    } finally {
      this.isSyncing = false;
      // Revert to idle state after showing success/error for 4 seconds
      setTimeout(() => {
        if (!this.isSyncing) {
          this.emit('idle');
        }
      }, 4000);
    }
  }

  // 5. Pull Phase: Get server modifications and apply locally
  private static async pull(): Promise<void> {
    const lastPulledAt = this.getLastPulledAt();
    const response = await fetch(`/api/sync/pull?last_pulled_at=${lastPulledAt}`);
    
    if (!response.ok) {
      throw new Error(`Pull phase failed: server returned status ${response.status}`);
    }

    const { tickets = [], server_timestamp = Date.now(), deleted_ids = [] } = await response.json();

    // Transactionally update local IndexedDB
    await db.transaction('rw', db.tickets, async () => {
      // Upsert tickets pulled from the server (unless local ticket is dirty/unpushed)
      for (const serverTicket of tickets) {
        const localTicket = await db.tickets.get(serverTicket.id);
        
        // Only overwrite if the local copy doesn't exist, OR it is not dirty
        if (!localTicket || localTicket.dirty === 0) {
          await db.tickets.put({
            ...serverTicket,
            dirty: 0,
            deleted: 0
          });
        }
      }

      // Perform hard deletes for items flagged by server
      if (deleted_ids.length > 0) {
        await db.tickets.bulkDelete(deleted_ids);
      }
    });

    this.setLastPulledAt(server_timestamp);
  }

  // 6. Push Phase: Send local offline edits to backend
  private static async push(): Promise<void> {
    // Query all locally modified (dirty) or soft-deleted tickets
    const localChanges = await db.tickets
      .filter(ticket => ticket.dirty === 1 || ticket.deleted === 1)
      .toArray();

    if (localChanges.length === 0) {
      return; // Nothing to push
    }

    const created: Ticket[] = [];
    const updated: Ticket[] = [];
    const deleted: string[] = [];

    // Group tickets using custom created_offline helper flag or deleted flag
    for (const ticket of localChanges) {
      if (ticket.deleted === 1) {
        deleted.push(ticket.id);
      } else if ((ticket as any).created_offline === 1) {
        // Remove helper field before sending to backend
        const { created_offline, ...cleanTicket } = ticket as any;
        created.push(cleanTicket);
      } else {
        const { created_offline, ...cleanTicket } = ticket as any;
        updated.push(cleanTicket);
      }
    }

    const response = await fetch('/api/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ created, updated, deleted }),
    });

    if (!response.ok) {
      throw new Error(`Push phase failed: server returned status ${response.status}`);
    }

    // On success: update Dexie records to reflect clean (synchronized) state
    await db.transaction('rw', db.tickets, async () => {
      // A. For soft-deleted records that are successfully pushed: perform permanent local hard delete
      if (deleted.length > 0) {
        await db.tickets.bulkDelete(deleted);
      }

      // B. For created and updated records: reset the dirty flag
      const activeIds = [...created.map(t => t.id), ...updated.map(t => t.id)];
      for (const id of activeIds) {
        const ticket = await db.tickets.get(id);
        if (ticket) {
          await db.tickets.put({
            ...ticket,
            dirty: 0,
            created_offline: 0 // clear offline creation helper if present
          } as any);
        }
      }
    });
  }
}

// 7. Auto-Sync Event Listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[SyncManager] Network online detected. Triggering sync...');
    SyncManager.sync();
  });

  window.addEventListener('offline', () => {
    console.log('[SyncManager] Network offline detected. Suspending sync activities.');
  });
}
