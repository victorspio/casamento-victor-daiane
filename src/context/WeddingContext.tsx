import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { WeddingConfig, Guest, WeddingTask, BudgetItem, Vendor } from '../types/wedding';
import * as storage from '../services/storage';
import { getAutomaticPriority } from '../data/mockData';
import { db } from '../lib/firebase';
import { doc, collection, onSnapshot } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeddingContextValue {
  // Data
  config: WeddingConfig;
  guests: Guest[];
  tasks: WeddingTask[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];

  // Config actions
  updateConfig: (config: WeddingConfig) => void;

  // Guest actions
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<Omit<Guest, 'id'>>) => void;
  deleteGuest: (id: string) => void;

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
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

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

    // 3. Tasks (with automatic priority recalculation on sync)
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

    // 4. Budget Items
    const unsubBudget = onSnapshot(collection(db, 'wedding', 'config', 'budgetItems'), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as BudgetItem));
      setBudgetItems(list);
    });

    // 5. Vendors
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
      unsubTasks();
      unsubBudget();
      unsubVendors();
    };
  }, []);

  // ─── Write Actions ──────────────────────────────────────────────────────────

  // Config
  const updateConfig = useCallback((c: WeddingConfig) => {
    storage.saveConfig(c);
  }, []);

  // Guests
  const addGuest = useCallback((g: Omit<Guest, 'id'>) => {
    storage.addGuest(g);
  }, []);

  const updateGuest = useCallback((id: string, updates: Partial<Omit<Guest, 'id'>>) => {
    storage.updateGuest(id, updates);
  }, []);

  const deleteGuest = useCallback((id: string) => {
    storage.deleteGuest(id);
  }, []);

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

  // Reset all (Loops over current collections in Firestore and removes them)
  const resetAll = useCallback(() => {
    storage.saveConfig({ groom: '', bride: '', weddingDate: '', venue: '', city: '', targetBudget: 0 });
    guests.forEach((g) => storage.deleteGuest(g.id));
    tasks.forEach((t) => storage.deleteTask(t.id));
    budgetItems.forEach((i) => storage.deleteBudgetItem(i.id));
    vendors.forEach((v) => storage.deleteVendor(v.id));
  }, [guests, tasks, budgetItems, vendors]);

  return (
    <WeddingContext.Provider
      value={{
        config, guests, tasks, budgetItems, vendors,
        updateConfig,
        addGuest, updateGuest, deleteGuest,
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
