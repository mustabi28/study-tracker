'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BookOpen, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditLogModalProps {
  log: {
    _id: string;
    date: string | Date;
    subject: string;
    chapter: string;
    lesson: string;
    minutesStudied: number;
    notes?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function EditLogModal({ log, isOpen, onClose }: EditLogModalProps) {
  const [date, setDate] = useState(() => {
    const parsedDate = typeof log.date === 'string' ? log.date : new Date(log.date).toISOString();
    return parsedDate.split('T')[0];
  });
  const [subject, setSubject] = useState(log.subject);
  const [chapter, setChapter] = useState(log.chapter);
  const [lesson, setLesson] = useState(log.lesson);
  const [minutes, setMinutes] = useState(log.minutesStudied);
  const [notes, setNotes] = useState(log.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !chapter || !lesson || !minutes) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/logs/${log._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          subject,
          chapter,
          lesson,
          minutesStudied: minutes,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update study log');
      }

      onClose();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-[#1E2124] text-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-800 overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#C9A15A]" />
                  <h2 className="text-xl font-bold tracking-wide">Edit Study Entry</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full bg-[#16181a] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-white"
                    />
                  </div>

                  {/* Minutes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Minutes Studied *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                      className="w-full bg-[#16181a] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-white"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#16181a] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-white placeholder-gray-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Chapter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400">Chapter *</label>
                    <input
                      type="text"
                      required
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      className="w-full bg-[#16181a] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-white placeholder-gray-600"
                    />
                  </div>

                  {/* Lesson */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400">Lesson *</label>
                    <input
                      type="text"
                      required
                      value={lesson}
                      onChange={(e) => setLesson(e.target.value)}
                      className="w-full bg-[#16181a] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#16181a] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-white placeholder-gray-600 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#C9A15A] hover:bg-[#B88F48] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md shadow-[#C9A15A]/15 flex items-center gap-1.5"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
