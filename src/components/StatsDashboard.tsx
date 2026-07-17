'use client';

import { useState, useMemo } from 'react';
import { getSubjectColor } from '@/lib/color';
import WeeklyBarChart from './WeeklyBarChart';
import { 
  Flame, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  Award
} from 'lucide-react';

interface StudyLogType {
  _id: string;
  date: string | Date;
  subject: string;
  chapter: string;
  lesson: string;
  minutesStudied: number;
  notes?: string;
}

interface StatsDashboardProps {
  logs: StudyLogType[];
  streak: number;
}

type PeriodType = 'daily' | 'weekly' | 'monthly';

export default function StatsDashboard({ logs, streak }: StatsDashboardProps) {
  const [period, setPeriod] = useState<PeriodType>('weekly');

  const stats = useMemo(() => {
    const now = new Date();
    
    // Set boundaries
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const currentDay = now.getDay();
    const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Filter logs based on selected period
    let filteredLogs = [];
    if (period === 'daily') {
      filteredLogs = logs.filter(log => {
        const d = new Date(log.date);
        return d >= todayStart && d <= todayEnd;
      });
    } else if (period === 'weekly') {
      filteredLogs = logs.filter(log => {
        const d = new Date(log.date);
        return d >= startOfWeek && d <= endOfWeek;
      });
    } else {
      // Monthly
      filteredLogs = logs.filter(log => {
        const d = new Date(log.date);
        return d >= startOfMonth && d <= endOfMonth;
      });
    }

    // Calculations
    const totalMinutes = filteredLogs.reduce((sum, log) => sum + log.minutesStudied, 0);
    const sessionCount = filteredLogs.length;

    const subjectMinutesMap: { [subject: string]: number } = {};
    filteredLogs.forEach(log => {
      subjectMinutesMap[log.subject] = (subjectMinutesMap[log.subject] || 0) + log.minutesStudied;
    });

    const chartData = Object.entries(subjectMinutesMap).map(([subject, mins]) => ({
      subject,
      hours: parseFloat((mins / 60).toFixed(1)),
      fill: getSubjectColor(subject).hex
    })).sort((a, b) => b.hours - a.hours);

    return {
      totalMinutes,
      sessionCount,
      chartData,
      subjectBreakdown: Object.entries(subjectMinutesMap).map(([subject, mins]) => ({
        subject,
        minutes: mins,
        color: getSubjectColor(subject)
      })).sort((a, b) => b.minutes - a.minutes)
    };
  }, [logs, period]);

  const periodLabel = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
  }[period];

  return (
    <div className="space-y-8">
      {/* Period Selector Toggle */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-[#1E2124] tracking-tight">Period Breakdown</h2>
        <div className="flex bg-[#F5F3EF] p-1 rounded-xl">
          {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                period === p
                  ? 'bg-[#1E2124] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1: Total Time */}
        <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md flex items-center gap-4">
          <div className="p-4 bg-[#C9A15A]/10 border border-[#C9A15A]/25 text-[#C9A15A] rounded-2xl">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Time ({periodLabel})</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1">
              {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">{stats.sessionCount} total sessions logged</p>
          </div>
        </div>

        {/* Stat 2: Streak */}
        <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md flex items-center gap-4">
          <div className="p-4 bg-orange-500/10 border border-orange-500/25 text-orange-500 rounded-2xl">
            <Flame className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Study Streak</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Consecutive days with ≥1 log</p>
          </div>
        </div>

        {/* Stat 3: Average Daily Study */}
        <div className="bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-2xl">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Avg Session Time</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1">
              {stats.sessionCount > 0 ? Math.round(stats.totalMinutes / stats.sessionCount) : 0}m
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Minutes per individual study log</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Subject Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Chart */}
        <div className="lg:col-span-2 bg-[#1E2124] text-white p-6 rounded-2xl border border-[#2d3135] shadow-md space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Time Per Subject</h2>
              <p className="text-xs text-gray-400">Distribution of study hours in {periodLabel}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[#C9A15A]" />
          </div>

          <WeeklyBarChart data={stats.chartData} />
        </div>

        {/* Right Side: Subject Cards List */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6 flex flex-col">
          <div className="pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1E2124] tracking-tight">Subject Leader</h2>
            <p className="text-xs text-gray-500">Breakdown of time studied by topic</p>
          </div>

          {stats.subjectBreakdown.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-12 text-center text-gray-500">
              <BookOpen className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm font-semibold">No logs in this period</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
              {stats.subjectBreakdown.map((row) => {
                const hrs = Math.floor(row.minutes / 60);
                const mins = row.minutes % 60;
                return (
                  <div 
                    key={row.subject}
                    className={`flex items-center justify-between p-3.5 bg-[#F5F3EF] border-l-4 ${row.color.border} rounded-xl shadow-sm`}
                  >
                    <span className="text-xs font-bold text-[#1E2124] uppercase tracking-wide truncate max-w-[140px]">
                      {row.subject}
                    </span>
                    <span className="text-xs font-bold text-gray-600">
                      {hrs > 0 ? `${hrs}h ` : ''}{mins}m
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
