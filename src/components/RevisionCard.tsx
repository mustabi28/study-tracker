'use client';

import { useState } from 'react';
import { getSubjectColor } from '@/lib/color';
import { Check, X, BookOpen, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RevisionCardProps {
  revision: {
    _id: string;
    dueDate: string | Date;
    interval: 7 | 14;
    status: 'pending' | 'done' | 'skipped';
    studyLogId?: {
      _id: string;
      subject: string;
      chapter: string;
      lesson: string;
      minutesStudied: number;
    } | null;
  };
}

export default function RevisionCard({ revision }: RevisionCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // If the associated study log was deleted, skip rendering or show placeholder
  if (!revision.studyLogId) {
    return null;
  }

  const { subject, chapter, lesson, minutesStudied } = revision.studyLogId;
  const subjectStyle = getSubjectColor(subject);

  const handleStatusUpdate = async (status: 'done' | 'skipped') => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/revisions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          revisionId: revision._id,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update revision status');
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update revision');
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-[#1E2124] text-white p-4 rounded-xl border-l-4 ${subjectStyle.border} border-y border-r border-[#2d3135] shadow-sm relative flex flex-col justify-between hover:shadow-md transition-shadow duration-300 ${isUpdating ? 'opacity-40 pointer-events-none' : ''}`}>
      {/* Subject and Days badge */}
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${subjectStyle.bg} ${subjectStyle.text} border ${subjectStyle.border}/20 w-fit`}>
          {subject}
        </span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C9A15A]/10 border border-[#C9A15A]/25 text-[#C9A15A] font-semibold text-[10px]">
          Day {revision.interval}
        </span>
      </div>

      {/* Lesson details */}
      <div className="space-y-1 mb-3">
        <h4 className="text-xs font-bold tracking-wide flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-[#C9A15A]" /> {chapter}
        </h4>
        <p className="text-[11px] text-gray-400 font-medium pl-4">{lesson}</p>
        <span className="text-[10px] text-gray-500 flex items-center gap-1 pl-4 mt-0.5">
          <Clock className="h-3 w-3" /> Orig. {minutesStudied}m study
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-gray-800/60 pt-3">
        <button
          onClick={() => handleStatusUpdate('done')}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[#C9A15A]/10 hover:bg-[#C9A15A] border border-[#C9A15A]/20 hover:border-transparent text-[#C9A15A] hover:text-white transition-all duration-300 flex items-center justify-center gap-1"
        >
          <Check className="h-3.5 w-3.5" /> Done
        </button>
        <button
          onClick={() => handleStatusUpdate('skipped')}
          className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-transparent hover:bg-rose-500/10 border border-gray-800 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 transition-all duration-300 flex items-center justify-center"
          title="Skip revision"
        >
          <X className="h-3.5 w-3.5" /> Skip
        </button>
      </div>
    </div>
  );
}
