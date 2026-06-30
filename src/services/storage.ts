/**
 * storage.ts — Camada de persistência integrada ao Firebase Firestore.
 */

import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import type {
  WeddingConfig,
  Guest,
  WeddingTask,
  BudgetItem,
  Vendor,
} from '../types/wedding';

// ─── Config ──────────────────────────────────────────────────────────────────
export async function saveConfig(config: WeddingConfig): Promise<void> {
  const configDocRef = doc(db, 'wedding', 'config');
  await setDoc(configDocRef, config, { merge: true });
}

// ─── Guests ──────────────────────────────────────────────────────────────────
export async function addGuest(guest: Omit<Guest, 'id'>): Promise<void> {
  const guestsColRef = collection(db, 'wedding', 'config', 'guests');
  await addDoc(guestsColRef, guest);
}

export async function updateGuest(id: string, updates: Partial<Omit<Guest, 'id'>>): Promise<void> {
  const guestDocRef = doc(db, 'wedding', 'config', 'guests', id);
  await updateDoc(guestDocRef, updates);
}

export async function deleteGuest(id: string): Promise<void> {
  const guestDocRef = doc(db, 'wedding', 'config', 'guests', id);
  await deleteDoc(guestDocRef);
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export async function addTask(task: Omit<WeddingTask, 'id'>): Promise<void> {
  const tasksColRef = collection(db, 'wedding', 'config', 'tasks');
  await addDoc(tasksColRef, task);
}

export async function updateTask(id: string, updates: Partial<Omit<WeddingTask, 'id'>>): Promise<void> {
  const taskDocRef = doc(db, 'wedding', 'config', 'tasks', id);
  await updateDoc(taskDocRef, updates);
}

export async function deleteTask(id: string): Promise<void> {
  const taskDocRef = doc(db, 'wedding', 'config', 'tasks', id);
  await deleteDoc(taskDocRef);
}

// ─── Budget Items ─────────────────────────────────────────────────────────────
export async function addBudgetItem(item: Omit<BudgetItem, 'id'>): Promise<void> {
  const budgetColRef = collection(db, 'wedding', 'config', 'budgetItems');
  await addDoc(budgetColRef, item);
}

export async function updateBudgetItem(id: string, updates: Partial<Omit<BudgetItem, 'id'>>): Promise<void> {
  const itemDocRef = doc(db, 'wedding', 'config', 'budgetItems', id);
  await updateDoc(itemDocRef, updates);
}

export async function deleteBudgetItem(id: string): Promise<void> {
  const itemDocRef = doc(db, 'wedding', 'config', 'budgetItems', id);
  await deleteDoc(itemDocRef);
}

// ─── Vendors ─────────────────────────────────────────────────────────────────
export async function addVendor(vendor: Omit<Vendor, 'id'>): Promise<void> {
  const vendorsColRef = collection(db, 'wedding', 'config', 'vendors');
  await addDoc(vendorsColRef, vendor);
}

export async function updateVendor(id: string, updates: Partial<Omit<Vendor, 'id'>>): Promise<void> {
  const vendorDocRef = doc(db, 'wedding', 'config', 'vendors', id);
  await updateDoc(vendorDocRef, updates);
}

export async function deleteVendor(id: string): Promise<void> {
  const vendorDocRef = doc(db, 'wedding', 'config', 'vendors', id);
  await deleteDoc(vendorDocRef);
}
