'use client';

import { useState } from 'react';
import RevisionCard from './RevisionCard';
import { Search, Calendar, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface RevisionType {
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
}

interface RevisionsListProps {
  initialRevisions: RevisionType[];
}

type TabType = 'all' | 'pending' | 'done' | 'skipped';

export default function RevisionsList({ initialRevisions }: RevisionsListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Filter revisions based on tab and search query
  const filteredRevisions = initialRevisions.filter((rev) => {
    if (!rev.studyLogId) return false;
    
    // Status Filter
    if (activeTab !== 'all' && rev.status !== activeTab) {
      return false;
    }

    // Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const subject = rev.studyLogId.subject.toLowerCase();
      const chapter = rev.studyLogId.chapter.toLowerCase();
      const lesson = rev.studyLogId.lesson.toLowerCase();
      return subject.includes(query) || chapter.includes(query) || lesson.includes(query);
    }

    return true;
  });

  // Calculate counts for badges
  const counts = {
    all: initialRevisions.filter(r => r.studyLogId).length,
    pending: initialRevisions.filter(r => r.studyLogId && r.status === 'pending').length,
    done: initialRevisions.filter(r => r.studyLogId && r.status === 'done').length,
    skipped: initialRevisions.filter(r => r.studyLogId && r.status === 'skipped').length,
  };

  return (
    <div className="space-y-6">
      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Tab Buttons */}
        <div className="flex bg-[#F5F3EF] p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['all', 'pending', 'done', 'skipped'] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1E2124] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab} ({counts[tab]})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject, chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F3EF] border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A15A] text-[#1E2124] placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Grid List of Revisions */}
      {filteredRevisions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#1E2124]">No revisions found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
            {searchQuery 
              ? 'No scheduled revisions match your search term. Try another query.' 
              : `You have no revision logs in the "${activeTab}" category.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRevisions.map((rev) => {
            const isPending = rev.status === 'pending';
            const isOverdue = isPending && new Date(rev.dueDate) < startOfToday;
            const formattedDate = new Date(rev.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div key={rev._id} className="relative group">
                <RevisionCard revision={rev} />
                
                {/* Overlay details for full page: Due Date */}
                <div className="mt-3 flex justify-between items-center text-xs px-2">
                  <span className="text-gray-400 font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Due: {formattedDate}
                  </span>
                  
                  {/* Status Indicator */}
                  {isOverdue && (
                    <span className="text-rose-500 font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      <AlertCircle className="h-3.5 w-3.5" /> Overdue
                    </span>
                  )}
                  {rev.status === 'done' && (
                    <span className="text-emerald-500 font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </span>
                  )}
                  {rev.status === 'skipped' && (
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                      Skipped
                    </span>
                  )}
                  {isPending && !isOverdue && (
                    <span className="text-[#C9A15A] font-bold uppercase tracking-wider text-[10px]">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
