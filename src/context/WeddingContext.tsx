import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { WeddingConfig, Guest, Invite, InviteWithGuests, WeddingTask, BudgetItem, Vendor } from '../types/wedding';
import * as storage from '../services/storage';
import { getAutomaticPriority } from '../data/mockData';
import { db } from '../lib/firebase';
import { doc, collection, onSnapshot } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeddingContextValue {
  // Data
  config: WeddingConfig;
  guests: Guest[];
  invites: Invite[];
  invitesWithGuests: InviteWithGuests[];
  tasks: WeddingTask[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];

  // Config actions
  updateConfig: (config: WeddingConfig) => void;

  // Invite actions
  createInvite: (inviteData: Omit<Invite, 'id'>, guestData: Omit<Guest, 'id' | 'inviteId'>) => void;
  bulkCreateInvites: (items: Array<{ invite: Omit<Invite, 'id'>; guest: Omit<Guest, 'id' | 'inviteId'> }>) => void;
  updateInvite: (id: string, updates: Partial<Omit<Invite, 'id'>>) => void;
  deleteInvite: (inviteId: string) => void;
  addPersonToInvite: (inviteId: string, guestData: Omit<Guest, 'id' | 'inviteId'>) => void;
  mergeInvites: (targetId: string, sourceIds: string[], displayName?: string) => void;
  splitGuest: (guestId: string) => void;

  // Guest actions (individual edits — still needed for RSVP page etc.)
  updateGuest: (id: string, updates: Partial<Omit<Guest, 'id'>>) => void;
  deleteGuest: (guestId: string) => void;

  // Task actions
  addTask: (task: Omit<WeddingTask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Omit<WeddingTask, 'id'>>) => void;
  deleteTask: (id: string) => void;

  // Budget actions
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<Omit<BudgetItem, 'id'>>) => void;
  deleteBudgetItem: (id: string) => void;

  // Vendor actions
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<Omit<Vendor, 'id'>>) => void;
  deleteVendor: (id: string) => void;

  // Reset
  resetAll: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WeddingContext = createContext<WeddingContextValue | null>(null);

export function useWedding(): WeddingContextValue {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error('useWedding must be used inside WeddingProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WeddingConfig>({
    groom: '',
    bride: '',
    weddingDate: '',
    venue: '',
    city: '',
    targetBudget: 0,
  });
  const [guests, setGuests] = useState<Guest[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Garante que a migração só roda uma vez por sessão
  const migrationDoneRef = useRef(false);

  // ─── Real-Time Firestore Sync ───────────────────────────────────────────────
  useEffect(() => {
    // 1. Config
    const unsubConfig = onSnapshot(doc(db, 'wedding', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as WeddingConfig);
      }
    });

    // 2. Guests
    const unsubGuests = onSnapshot(collection(db, 'wedding', 'config', 'guests'), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Guest));
      setGuests(list);
    });

    // 3. Invites
    const unsubInvites = onSnapshot(collection(db, 'wedding', 'config', 'invites'), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Invite));
      setInvites(list);
    });

    // 4. Tasks (with automatic priority recalculation on sync)
    const unsubTasks = onSnapshot(collection(db, 'wedding', 'config', 'tasks'), (snapshot) => {
      const list = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          priority: getAutomaticPriority(data.dueDate ?? ''),
        } as WeddingTask;
      });
      setTasks(list);
    });

    // 5. Budget Items
    const unsubBudget = onSnapshot(collection(db, 'wedding', 'config', 'budgetItems'), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as BudgetItem));
      setBudgetItems(list);
    });

    // 6. Vendors
    const unsubVendors = onSnapshot(collection(db, 'wedding', 'config', 'vendors'), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Vendor));
      setVendors(list);
    });

    return () => {
      unsubConfig();
      unsubGuests();
      unsubInvites();
      unsubTasks();
      unsubBudget();
      unsubVendors();
    };
  }, []);

  // ─── Migração automática ────────────────────────────────────────────────────
  // Detecta guests sem inviteId e cria convites para eles (uma única vez).
  useEffect(() => {
    if (migrationDoneRef.current) return;
    if (guests.length === 0) return; // aguarda Firestore responder
    migrationDoneRef.current = true;
    const unmigrated = guests.filter(g => !g.inviteId);
    if (unmigrated.length > 0) {
      storage.migrateGuestsToInvites(unmigrated);
    }
  }, [guests]);

  // ─── Tipo derivado: InviteWithGuests ────────────────────────────────────────
  const invitesWithGuests = useMemo<InviteWithGuests[]>(() => {
    return invites.map(invite => {
      const iGuests = guests.filter(g => g.inviteId === invite.id);
      const confirmedCount = iGuests.filter(g => g.status === 'confirmed').length;
      const autoName = iGuests.map(g => g.name).join(' + ') || 'Convidado';
      return {
        invite,
        guests: iGuests,
        displayName: invite.displayName || autoName,
        confirmedCount,
        totalCount: iGuests.length,
      };
    });
  }, [invites, guests]);

  // ─── Write Actions ──────────────────────────────────────────────────────────

  // Config
  const updateConfig = useCallback((c: WeddingConfig) => {
    storage.saveConfig(c);
  }, []);

  // Invites
  const createInvite = useCallback((
    inviteData: Omit<Invite, 'id'>,
    guestData: Omit<Guest, 'id' | 'inviteId'>,
  ) => {
    storage.createInvite(inviteData, guestData);
  }, []);

  const bulkCreateInvites = useCallback((
    items: Array<{ invite: Omit<Invite, 'id'>; guest: Omit<Guest, 'id' | 'inviteId'> }>,
  ) => {
    storage.createInvitesBulk(items);
  }, []);

  const updateInvite = useCallback((id: string, updates: Partial<Omit<Invite, 'id'>>) => {
    storage.updateInvite(id, updates);
  }, []);

  const deleteInvite = useCallback((inviteId: string) => {
    const guestIds = guests.filter(g => g.inviteId === inviteId).map(g => g.id);
    storage.deleteInvite(inviteId, guestIds);
  }, [guests]);

  const addPersonToInvite = useCallback((inviteId: string, guestData: Omit<Guest, 'id' | 'inviteId'>) => {
    storage.addPersonToInvite(inviteId, guestData);
  }, []);

  const mergeInvites = useCallback((targetId: string, sourceIds: string[], displayName?: string) => {
    const guestIdsByInvite: Record<string, string[]> = {};
    sourceIds.forEach(id => {
      guestIdsByInvite[id] = guests.filter(g => g.inviteId === id).map(g => g.id);
    });
    storage.mergeInvites(targetId, sourceIds, guestIdsByInvite, displayName);
  }, [guests]);

  const splitGuest = useCallback((guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;
    storage.splitGuest(guestId, { group: guest.group, tableNumber: guest.tableNumber });
  }, [guests]);

  // Guest individual ops
  const updateGuest = useCallback((id: string, updates: Partial<Omit<Guest, 'id'>>) => {
    storage.updateGuest(id, updates);
  }, []);

  const deleteGuest = useCallback((guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;
    const isLast = guests.filter(g => g.inviteId === guest.inviteId).length <= 1;
    storage.deleteGuest(guestId, guest.inviteId, isLast);
  }, [guests]);

  // Tasks
  const addTask = useCallback((t: Omit<WeddingTask, 'id'>) => {
    storage.addTask(t);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<WeddingTask, 'id'>>) => {
    storage.updateTask(id, updates);
  }, []);

  const deleteTask = useCallback((id: string) => {
    storage.deleteTask(id);
  }, []);

  // Budget
  const addBudgetItem = useCallback((item: Omit<BudgetItem, 'id'>) => {
    storage.addBudgetItem(item);
  }, []);

  const updateBudgetItem = useCallback((id: string, updates: Partial<Omit<BudgetItem, 'id'>>) => {
    storage.updateBudgetItem(id, updates);
  }, []);

  const deleteBudgetItem = useCallback((id: string) => {
    storage.deleteBudgetItem(id);
  }, []);

  // Vendors
  const addVendor = useCallback((v: Omit<Vendor, 'id'>) => {
    storage.addVendor(v);
  }, []);

  const updateVendor = useCallback((id: string, updates: Partial<Omit<Vendor, 'id'>>) => {
    storage.updateVendor(id, updates);
  }, []);

  const deleteVendor = useCallback((id: string) => {
    storage.deleteVendor(id);
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    storage.saveConfig({ groom: '', bride: '', weddingDate: '', venue: '', city: '', targetBudget: 0 });
    invites.forEach(i => {
      const guestIds = guests.filter(g => g.inviteId === i.id).map(g => g.id);
      storage.deleteInvite(i.id, guestIds);
    });
    tasks.forEach(t => storage.deleteTask(t.id));
    budgetItems.forEach(i => storage.deleteBudgetItem(i.id));
    vendors.forEach(v => storage.deleteVendor(v.id));
  }, [guests, invites, tasks, budgetItems, vendors]);

  return (
    <WeddingContext.Provider
      value={{
        config, guests, invites, invitesWithGuests, tasks, budgetItems, vendors,
        updateConfig,
        createInvite, bulkCreateInvites, updateInvite, deleteInvite,
        addPersonToInvite, mergeInvites, splitGuest,
        updateGuest, deleteGuest,
        addTask, updateTask, deleteTask,
        addBudgetItem, updateBudgetItem, deleteBudgetItem,
        addVendor, updateVendor, deleteVendor,
        resetAll,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
}
