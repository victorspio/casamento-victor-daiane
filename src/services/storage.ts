/**
 * storage.ts — Camada de abstração de dados
 *
 * Hoje: localStorage
 * Para migrar ao Firebase, substitua os corpos das funções por chamadas ao Firestore.
 * Os componentes e o contexto não precisam ser alterados.
 *
 * Estrutura Firebase equivalente:
 *   wedding/config            → documento único de configuração
 *   wedding/guests/{id}       → convidados
 *   wedding/tasks/{id}        → tarefas
 *   wedding/budgetItems/{id}  → itens de orçamento
 *   wedding/vendors/{id}      → fornecedores
 */

import type {
  WeddingConfig,
  Guest,
  WeddingTask,
  BudgetItem,
  Vendor,
} from '../types/wedding';

// ─── Keys ────────────────────────────────────────────────────────────────────
const KEYS = {
  config: 'wedding:config',
  guests: 'wedding:guests',
  tasks: 'wedding:tasks',
  budgetItems: 'wedding:budgetItems',
  vendors: 'wedding:vendors',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Config ──────────────────────────────────────────────────────────────────
// TODO (Firebase): substituir por getDoc(doc(db, 'wedding', 'config'))
export function getConfig(): WeddingConfig {
  return load<WeddingConfig>(KEYS.config, {
    groom: '',
    bride: '',
    weddingDate: '',
    venue: '',
    city: '',
    targetBudget: 0,
  });
}

// TODO (Firebase): substituir por setDoc(doc(db, 'wedding', 'config'), config, { merge: true })
export function saveConfig(config: WeddingConfig): void {
  save(KEYS.config, config);
}

// ─── Guests ──────────────────────────────────────────────────────────────────
// TODO (Firebase): substituir por getDocs(collection(db, 'wedding', 'config', 'guests'))
export function getGuests(): Guest[] {
  return load<Guest[]>(KEYS.guests, []);
}

// TODO (Firebase): substituir por addDoc(collection(db, 'wedding', 'config', 'guests'), guest)
export function addGuest(guest: Omit<Guest, 'id'>): Guest {
  const guests = getGuests();
  const newGuest: Guest = { ...guest, id: generateId() };
  save(KEYS.guests, [...guests, newGuest]);
  return newGuest;
}

// TODO (Firebase): substituir por updateDoc(doc(db, 'wedding', 'config', 'guests', id), updates)
export function updateGuest(id: string, updates: Partial<Omit<Guest, 'id'>>): void {
  const guests = getGuests().map((g) => (g.id === id ? { ...g, ...updates } : g));
  save(KEYS.guests, guests);
}

// TODO (Firebase): substituir por deleteDoc(doc(db, 'wedding', 'config', 'guests', id))
export function deleteGuest(id: string): void {
  save(KEYS.guests, getGuests().filter((g) => g.id !== id));
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
// TODO (Firebase): substituir por getDocs(collection(db, 'wedding', 'config', 'tasks'))
export function getTasks(): WeddingTask[] {
  return load<WeddingTask[]>(KEYS.tasks, []);
}

// TODO (Firebase): substituir por addDoc(...)
export function addTask(task: Omit<WeddingTask, 'id'>): WeddingTask {
  const tasks = getTasks();
  const newTask: WeddingTask = { ...task, id: generateId() };
  save(KEYS.tasks, [...tasks, newTask]);
  return newTask;
}

// TODO (Firebase): substituir por updateDoc(...)
export function updateTask(id: string, updates: Partial<Omit<WeddingTask, 'id'>>): void {
  const tasks = getTasks().map((t) => (t.id === id ? { ...t, ...updates } : t));
  save(KEYS.tasks, tasks);
}

// TODO (Firebase): substituir por deleteDoc(...)
export function deleteTask(id: string): void {
  save(KEYS.tasks, getTasks().filter((t) => t.id !== id));
}

// ─── Budget Items ─────────────────────────────────────────────────────────────
// TODO (Firebase): substituir por getDocs(collection(db, 'wedding', 'config', 'budgetItems'))
export function getBudgetItems(): BudgetItem[] {
  return load<BudgetItem[]>(KEYS.budgetItems, []);
}

// TODO (Firebase): substituir por addDoc(...)
export function addBudgetItem(item: Omit<BudgetItem, 'id'>): BudgetItem {
  const items = getBudgetItems();
  const newItem: BudgetItem = { ...item, id: generateId() };
  save(KEYS.budgetItems, [...items, newItem]);
  return newItem;
}

// TODO (Firebase): substituir por updateDoc(...)
export function updateBudgetItem(id: string, updates: Partial<Omit<BudgetItem, 'id'>>): void {
  const items = getBudgetItems().map((i) => (i.id === id ? { ...i, ...updates } : i));
  save(KEYS.budgetItems, items);
}

// TODO (Firebase): substituir por deleteDoc(...)
export function deleteBudgetItem(id: string): void {
  save(KEYS.budgetItems, getBudgetItems().filter((i) => i.id !== id));
}

// ─── Vendors ─────────────────────────────────────────────────────────────────
// TODO (Firebase): substituir por getDocs(collection(db, 'wedding', 'config', 'vendors'))
export function getVendors(): Vendor[] {
  return load<Vendor[]>(KEYS.vendors, []);
}

// TODO (Firebase): substituir por addDoc(...)
export function addVendor(vendor: Omit<Vendor, 'id'>): Vendor {
  const vendors = getVendors();
  const newVendor: Vendor = { ...vendor, id: generateId() };
  save(KEYS.vendors, [...vendors, newVendor]);
  return newVendor;
}

// TODO (Firebase): substituir por updateDoc(...)
export function updateVendor(id: string, updates: Partial<Omit<Vendor, 'id'>>): void {
  const vendors = getVendors().map((v) => (v.id === id ? { ...v, ...updates } : v));
  save(KEYS.vendors, vendors);
}

// TODO (Firebase): substituir por deleteDoc(...)
export function deleteVendor(id: string): void {
  save(KEYS.vendors, getVendors().filter((v) => v.id !== id));
}

// ─── Reset ───────────────────────────────────────────────────────────────────
// TODO (Firebase): deletar todos os documentos das subcoleções
export function resetAll(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
