import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { WeddingConfig, Guest, WeddingTask, BudgetItem, Vendor } from '../types/wedding';
import * as storage from '../services/storage';
import { getAutomaticPriority } from '../data/mockData';

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
// TODO (Firebase): substituir os useState + useEffect por onSnapshot listeners
// para sincronização em tempo real com o Firestore.

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WeddingConfig>(() => storage.getConfig());
  const [guests, setGuests] = useState<Guest[]>(() => storage.getGuests());

  // Helper to load tasks with dynamic priorities computed at runtime
  const getTasksWithAutoPriority = useCallback(() => {
    return storage.getTasks().map((task) => ({
      ...task,
      priority: getAutomaticPriority(task.dueDate),
    }));
  }, []);

  const [tasks, setTasks] = useState<WeddingTask[]>(() => getTasksWithAutoPriority());
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => storage.getBudgetItems());
  const [vendors, setVendors] = useState<Vendor[]>(() => storage.getVendors());

  // Sync state → localStorage on every change
  // TODO (Firebase): remover esses useEffects quando usar onSnapshot
  useEffect(() => { storage.saveConfig(config); }, [config]);
  useEffect(() => { /* guests are saved immediately on mutation */ }, [guests]);
  useEffect(() => { /* tasks are saved immediately on mutation */ }, [tasks]);
  useEffect(() => { /* budgetItems are saved immediately on mutation */ }, [budgetItems]);
  useEffect(() => { /* vendors are saved immediately on mutation */ }, [vendors]);

  // Config
  const updateConfig = useCallback((c: WeddingConfig) => {
    storage.saveConfig(c);
    setConfig(c);
  }, []);

  // Guests
  const addGuest = useCallback((g: Omit<Guest, 'id'>) => {
    const newGuest = storage.addGuest(g);
    setGuests(storage.getGuests());
    return newGuest;
  }, []);

  const updateGuest = useCallback((id: string, updates: Partial<Omit<Guest, 'id'>>) => {
    storage.updateGuest(id, updates);
    setGuests(storage.getGuests());
  }, []);

  const deleteGuest = useCallback((id: string) => {
    storage.deleteGuest(id);
    setGuests(storage.getGuests());
  }, []);

  // Tasks
  const addTask = useCallback((t: Omit<WeddingTask, 'id'>) => {
    storage.addTask(t);
    setTasks(getTasksWithAutoPriority());
  }, [getTasksWithAutoPriority]);

  const updateTask = useCallback((id: string, updates: Partial<Omit<WeddingTask, 'id'>>) => {
    storage.updateTask(id, updates);
    setTasks(getTasksWithAutoPriority());
  }, [getTasksWithAutoPriority]);

  const deleteTask = useCallback((id: string) => {
    storage.deleteTask(id);
    setTasks(getTasksWithAutoPriority());
  }, [getTasksWithAutoPriority]);

  // Budget
  const addBudgetItem = useCallback((item: Omit<BudgetItem, 'id'>) => {
    storage.addBudgetItem(item);
    setBudgetItems(storage.getBudgetItems());
  }, []);

  const updateBudgetItem = useCallback((id: string, updates: Partial<Omit<BudgetItem, 'id'>>) => {
    storage.updateBudgetItem(id, updates);
    setBudgetItems(storage.getBudgetItems());
  }, []);

  const deleteBudgetItem = useCallback((id: string) => {
    storage.deleteBudgetItem(id);
    setBudgetItems(storage.getBudgetItems());
  }, []);

  // Vendors
  const addVendor = useCallback((v: Omit<Vendor, 'id'>) => {
    storage.addVendor(v);
    setVendors(storage.getVendors());
  }, []);

  const updateVendor = useCallback((id: string, updates: Partial<Omit<Vendor, 'id'>>) => {
    storage.updateVendor(id, updates);
    setVendors(storage.getVendors());
  }, []);

  const deleteVendor = useCallback((id: string) => {
    storage.deleteVendor(id);
    setVendors(storage.getVendors());
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    storage.resetAll();
    const empty: WeddingConfig = { groom: '', bride: '', weddingDate: '', venue: '', city: '', targetBudget: 0 };
    setConfig(empty);
    setGuests([]);
    setTasks([]);
    setBudgetItems([]);
    setVendors([]);
  }, []);

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
