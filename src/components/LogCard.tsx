'use client';

import { useState } from 'react';
import { getSubjectColor } from '@/lib/color';
import { Clock, BookOpen, Trash2, Edit, MoreVertical, Calendar } from 'lucide-react';
import EditLogModal from './EditLogModal';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface LogCardProps {
  log: {
    _id: string;
    date: string | Date;
    subject: string;
    chapter: string;
    lesson: string;
    minutesStudied: number;
    notes?: string;
  };
}

export default function LogCard({ log }: LogCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();
  const subjectStyle = getSubjectColor(log.subject);
  const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this study log? This will also delete any scheduled revisions.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/logs/${log._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete log');
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to delete study log');
      setIsDeleting(false);
    }
  };

  return (
    <div className={`bg-[#1E2124] text-white p-5 rounded-2xl border-l-4 ${subjectStyle.border} border-y border-r border-[#2d3135] relative shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 min-h-[160px] overflow-hidden ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>
      {/* Subject Badge & Dropdown Actions */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col space-y-1">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${subjectStyle.bg} ${subjectStyle.text} border ${subjectStyle.border}/20 inline-block w-fit`}>
            {log.subject}
          </span>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formattedDate}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded-lg text-gray-500 hover:text-white transition-colors"
            aria-label="Actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div 
                  onClick={() => setShowDropdown(false)} 
                  className="fixed inset-0 z-10"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-28 bg-[#16181a] border border-gray-800 rounded-xl shadow-xl z-20 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setIsEditOpen(true);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-gray-800/50"
                  >
                    <Edit className="h-3.5 w-3.5 text-gray-400" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chapter & Lesson Details */}
      <div className="my-3 space-y-1">
        <h4 className="text-sm font-bold tracking-wide flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-[#C9A15A]" /> {log.chapter}
        </h4>
        <p className="text-xs text-gray-400 font-medium pl-5">{log.lesson}</p>
        
        {log.notes && (
          <p className="text-[11px] text-gray-500 font-normal italic pl-5 mt-1 border-l border-gray-800 max-w-full truncate">
            &ldquo;{log.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Duration */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 border-t border-gray-800/60 pt-3">
        <Clock className="h-3.5 w-3.5 text-[#C9A15A]" />
        <span>{log.minutesStudied} minutes</span>
      </div>

      {/* Edit Modal Hook */}
      {isEditOpen && (
        <EditLogModal 
          log={log} 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </div>
  );
}
