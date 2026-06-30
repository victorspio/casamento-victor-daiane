import type { TaskPriority } from '../types/wedding';

// ─── Countdown Calculator ──────────────────────────────────────────────────────
// Mantido aqui para uso no Dashboard e HeroBanner.
// Os dados do casamento agora vêm do WeddingContext (localStorage → Firebase).

export function calculateCountdown(targetDate: string) {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = Math.max(target - now, 0);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function getAutomaticPriority(dueDate: string): TaskPriority {
  if (!dueDate) return 'low';
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) return 'urgent';
  if (diffDays <= 45) return 'high';
  if (diffDays <= 120) return 'medium';
  return 'low';
}
