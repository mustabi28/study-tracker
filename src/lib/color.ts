const SUBJECT_COLORS = [
  { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', hex: '#3b82f6' },
  { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', hex: '#10b981' },
  { border: 'border-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-500', hex: '#8b5cf6' },
  { border: 'border-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-500', hex: '#f43f5e' },
  { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500', hex: '#f59e0b' },
  { border: 'border-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-500', hex: '#06b6d4' },
  { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500', hex: '#f97316' },
  { border: 'border-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-500', hex: '#6366f1' },
];

export function getSubjectColor(subjectName: string) {
  const name = (subjectName || '').trim().toLowerCase();
  if (!name) {
    return SUBJECT_COLORS[0];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[index];
}
