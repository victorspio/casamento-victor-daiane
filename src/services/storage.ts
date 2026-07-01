/**
 * storage.ts — Camada de persistência integrada ao Firebase Firestore.
 */

import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, addDoc, deleteDoc, collection, writeBatch } from 'firebase/firestore';
import type {
  WeddingConfig,
  Guest,
  Invite,
  WeddingTask,
  BudgetItem,
  Vendor,
} from '../types/wedding';

// ─── Helper ──────────────────────────────────────────────────────────────────
/** Remove campos com valor `undefined` para não quebrar o Firestore. */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

// ─── Config ──────────────────────────────────────────────────────────────────
export async function saveConfig(config: WeddingConfig): Promise<void> {
  const configDocRef = doc(db, 'wedding', 'config');
  await setDoc(configDocRef, config, { merge: true });
}

// ─── Invites ─────────────────────────────────────────────────────────────────

/**
 * Cria um convite + o primeiro convidado em batch atômico.
 * Retorna o inviteId gerado.
 */
export async function createInvite(
  inviteData: Omit<Invite, 'id'>,
  guestData: Omit<Guest, 'id' | 'inviteId'>,
): Promise<string> {
  const batch = writeBatch(db);
  const inviteRef = doc(collection(db, 'wedding', 'config', 'invites'));
  const guestRef = doc(collection(db, 'wedding', 'config', 'guests'));
  batch.set(inviteRef, stripUndefined(inviteData));
  batch.set(guestRef, stripUndefined({ ...guestData, inviteId: inviteRef.id }));
  await batch.commit();
  return inviteRef.id;
}

/**
 * Cria N pares (invite + guest) em um único batch.
 * Usado na importação em lote — cada nome vira um convite solo.
 * Firestore limite: 500 ops/batch; cada item = 2 writes → seguro até 250 itens.
 */
export async function createInvitesBulk(
  items: Array<{ invite: Omit<Invite, 'id'>; guest: Omit<Guest, 'id' | 'inviteId'> }>,
): Promise<void> {
  const batch = writeBatch(db);
  items.forEach(({ invite, guest }) => {
    const inviteRef = doc(collection(db, 'wedding', 'config', 'invites'));
    const guestRef = doc(collection(db, 'wedding', 'config', 'guests'));
    batch.set(inviteRef, stripUndefined(invite));
    batch.set(guestRef, stripUndefined({ ...guest, inviteId: inviteRef.id }));
  });
  await batch.commit();
}

export async function updateInvite(id: string, updates: Partial<Omit<Invite, 'id'>>): Promise<void> {
  const inviteDocRef = doc(db, 'wedding', 'config', 'invites', id);
  await updateDoc(inviteDocRef, stripUndefined(updates));
}

/** Exclui um convite e todos os seus convidados em batch atômico. */
export async function deleteInvite(inviteId: string, guestIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'wedding', 'config', 'invites', inviteId));
  guestIds.forEach(gid => {
    batch.delete(doc(db, 'wedding', 'config', 'guests', gid));
  });
  await batch.commit();
}

/** Adiciona uma nova pessoa a um convite existente. */
export async function addPersonToInvite(
  inviteId: string,
  guestData: Omit<Guest, 'id' | 'inviteId'>,
): Promise<void> {
  const guestRef = doc(collection(db, 'wedding', 'config', 'guests'));
  await setDoc(guestRef, stripUndefined({ ...guestData, inviteId }));
}

/**
 * Junta múltiplos convites em um único (targetInviteId).
 * Guests dos convites origem são movidos; convites origem são excluídos.
 */
export async function mergeInvites(
  targetInviteId: string,
  sourceInviteIds: string[],
  guestIdsByInvite: Record<string, string[]>,
  displayName?: string,
): Promise<void> {
  const batch = writeBatch(db);
  if (displayName !== undefined) {
    batch.update(doc(db, 'wedding', 'config', 'invites', targetInviteId), { displayName });
  }
  sourceInviteIds.forEach(srcId => {
    (guestIdsByInvite[srcId] ?? []).forEach(gid => {
      batch.update(doc(db, 'wedding', 'config', 'guests', gid), { inviteId: targetInviteId });
    });
    batch.delete(doc(db, 'wedding', 'config', 'invites', srcId));
  });
  await batch.commit();
}

/** Separa um convidado do seu convite atual, criando um novo convite solo. */
export async function splitGuest(
  guestId: string,
  newInviteData: Omit<Invite, 'id'>,
): Promise<void> {
  const batch = writeBatch(db);
  const newInviteRef = doc(collection(db, 'wedding', 'config', 'invites'));
  batch.set(newInviteRef, stripUndefined(newInviteData));
  batch.update(doc(db, 'wedding', 'config', 'guests', guestId), { inviteId: newInviteRef.id });
  await batch.commit();
}

/**
 * Migração automática: guests sem inviteId recebem um convite solo cada.
 * Executado em batch atômico na primeira carga do contexto.
 */
export async function migrateGuestsToInvites(unmigrated: Guest[]): Promise<void> {
  if (unmigrated.length === 0) return;
  const batch = writeBatch(db);
  unmigrated.forEach(g => {
    const inviteRef = doc(collection(db, 'wedding', 'config', 'invites'));
    batch.set(inviteRef, stripUndefined({ group: g.group, tableNumber: g.tableNumber }));
    batch.update(doc(db, 'wedding', 'config', 'guests', g.id), { inviteId: inviteRef.id });
  });
  await batch.commit();
}

// ─── Guests (operações individuais) ──────────────────────────────────────────

export async function updateGuest(id: string, updates: Partial<Omit<Guest, 'id'>>): Promise<void> {
  const guestDocRef = doc(db, 'wedding', 'config', 'guests', id);
  await updateDoc(guestDocRef, stripUndefined(updates));
}

/** Exclui um convidado. Se for o último do convite, exclui o convite também. */
export async function deleteGuest(
  guestId: string,
  inviteId: string,
  isLastInInvite: boolean,
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'wedding', 'config', 'guests', guestId));
  if (isLastInInvite) {
    batch.delete(doc(db, 'wedding', 'config', 'invites', inviteId));
  }
  await batch.commit();
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export async function addTask(task: Omit<WeddingTask, 'id'>): Promise<void> {
  const tasksColRef = collection(db, 'wedding', 'config', 'tasks');
  await addDoc(tasksColRef, stripUndefined(task));
}

export async function updateTask(id: string, updates: Partial<Omit<WeddingTask, 'id'>>): Promise<void> {
  const taskDocRef = doc(db, 'wedding', 'config', 'tasks', id);
  await updateDoc(taskDocRef, stripUndefined(updates));
}

export async function deleteTask(id: string): Promise<void> {
  const taskDocRef = doc(db, 'wedding', 'config', 'tasks', id);
  await deleteDoc(taskDocRef);
}

// ─── Budget Items ─────────────────────────────────────────────────────────────
export async function addBudgetItem(item: Omit<BudgetItem, 'id'>): Promise<void> {
  const budgetColRef = collection(db, 'wedding', 'config', 'budgetItems');
  await addDoc(budgetColRef, stripUndefined(item));
}

export async function updateBudgetItem(id: string, updates: Partial<Omit<BudgetItem, 'id'>>): Promise<void> {
  const itemDocRef = doc(db, 'wedding', 'config', 'budgetItems', id);
  await updateDoc(itemDocRef, stripUndefined(updates));
}

export async function deleteBudgetItem(id: string): Promise<void> {
  const itemDocRef = doc(db, 'wedding', 'config', 'budgetItems', id);
  await deleteDoc(itemDocRef);
}

// ─── Vendors ─────────────────────────────────────────────────────────────────
export async function addVendor(vendor: Omit<Vendor, 'id'>): Promise<void> {
  const vendorsColRef = collection(db, 'wedding', 'config', 'vendors');
  await addDoc(vendorsColRef, stripUndefined(vendor));
}

export async function updateVendor(id: string, updates: Partial<Omit<Vendor, 'id'>>): Promise<void> {
  const vendorDocRef = doc(db, 'wedding', 'config', 'vendors', id);
  await updateDoc(vendorDocRef, stripUndefined(updates));
}

export async function deleteVendor(id: string): Promise<void> {
  const vendorDocRef = doc(db, 'wedding', 'config', 'vendors', id);
  await deleteDoc(vendorDocRef);
}

