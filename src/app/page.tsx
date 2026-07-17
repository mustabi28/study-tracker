import Link from 'next/link';
import { Show, UserButton } from '@clerk/nextjs';
import { 
  GraduationCap, 
  Sparkles, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col font-sans selection:bg-[#C9A15A] selection:text-white relative overflow-hidden">
      {/* Repeating Dotted Triangle Background Texture (Subtle) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 20 L20 60 L60 60 Z' fill='none' stroke='%23C9A15A' stroke-width='2' stroke-dasharray='4,6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Header / Navbar */}
      <header className="w-full h-20 bg-[#1E2124] border-b border-[#2d3135] flex items-center justify-between px-6 md:px-12 z-10 sticky top-0 shadow-md">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-[#C9A15A]" />
          <span className="text-xl font-bold tracking-wider text-white">
            Study<span className="text-[#C9A15A]">Tracker</span>
          </span>
        </div>

        <nav className="flex items-center gap-4">
          <Show when="signed-in">
            <Link 
              href="/dashboard" 
              className="bg-[#C9A15A] hover:bg-[#B88F48] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg shadow-[#C9A15A]/20 flex items-center gap-1.5"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Link 
              href="/sign-in" 
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="bg-[#C9A15A] hover:bg-[#B88F48] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg shadow-[#C9A15A]/20"
            >
              Get Started
            </Link>
          </Show>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 md:py-32 bg-[#1E2124] text-white relative">
        {/* Hero Background Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 15 L15 45 L45 45 Z' fill='none' stroke='%23C9A15A' stroke-width='1.5' stroke-dasharray='3,5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <div className="max-w-4xl space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A15A]/10 border border-[#C9A15A]/30 text-[#C9A15A] text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Sparkles className="h-4 w-4" /> Spaced Repetition Revision Engine
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Stop Cramming. Start <span className="text-[#C9A15A]">Retaining.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
            Study Tracker automatically schedules critical revisions at <span className="text-[#C9A15A] font-semibold">Day 7</span> and <span className="text-[#C9A15A] font-semibold">Day 14</span>. Build double the retention, log study sessions, track streaks, and climb the leaderboard with friends.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Show when="signed-in">
              <Link 
                href="/dashboard" 
                className="bg-[#C9A15A] hover:bg-[#B88F48] text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-300 shadow-xl shadow-[#C9A15A]/25 flex items-center justify-center gap-2"
              >
                Access Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            </Show>
            <Show when="signed-out">
              <Link 
                href="/sign-up" 
                className="bg-[#C9A15A] hover:bg-[#B88F48] text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-300 shadow-xl shadow-[#C9A15A]/25 flex items-center justify-center gap-2"
              >
                Sign Up Now <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/sign-in" 
                className="bg-transparent hover:bg-white/5 border border-gray-600 text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-300"
              >
                Try Live Demo
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto z-10 w-full">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E2124] tracking-tight">
            Designed for Academic Excellence
          </h2>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Everything you need to optimize your study routines, track memory retention, and study with peer accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Study Log */}
          <div className="bg-[#1E2124] text-white p-8 rounded-2xl shadow-xl border border-[#2d3135] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#C9A15A]" />
            <div className="bg-[#C9A15A]/10 p-3.5 rounded-xl inline-block mb-6 border border-[#C9A15A]/20">
              <Clock className="h-6 w-6 text-[#C9A15A]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Daily Study Log</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Log date, subject, chapter, lesson, and durations. Entries are dynamically cataloged in beautifully color-coded subject cards.
            </p>
          </div>

          {/* Card 2: Revision Engine */}
          <div className="bg-[#1E2124] text-white p-8 rounded-2xl shadow-xl border border-[#2d3135] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#C9A15A]" />
            <div className="bg-[#C9A15A]/10 p-3.5 rounded-xl inline-block mb-6 border border-[#C9A15A]/20">
              <Calendar className="h-6 w-6 text-[#C9A15A]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Automatic Revision Engine</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              On entry creation, the platform auto-schedules memory prompts at +7 and +14 days. Revisions are grouped in a dedicated daily review interface.
            </p>
          </div>

          {/* Card 3: Social Leaderboard */}
          <div className="bg-[#1E2124] text-white p-8 rounded-2xl shadow-xl border border-[#2d3135] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#C9A15A]" />
            <div className="bg-[#C9A15A]/10 p-3.5 rounded-xl inline-block mb-6 border border-[#C9A15A]/20">
              <Users className="h-6 w-6 text-[#C9A15A]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Friend Leaderboards</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Compete on weekly study hours. Toggle your profile privacy settings, add friends by username, and climb the ranking ladder.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white border-t border-gray-100 w-full z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#1E2124] tracking-tight">
                The Science of Spaced Repetition
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Cramming information before an exam leads to rapid forgetfulness. According to the forgetting curve, reviewing material at increasing intervals locks knowledge into long-term memory.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A15A] shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700"><strong>Day 0:</strong> Initial learning log details the topics studied.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A15A] shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700"><strong>Day 7:</strong> First automated revision triggers to combat the initial drop in memory retention.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C9A15A] shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700"><strong>Day 14:</strong> Second automated revision cements the lesson forever.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#1E2124] p-8 rounded-2xl shadow-2xl border border-[#2d3135] text-white">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6">
                <span className="text-sm font-semibold tracking-wide text-gray-400">Memory Retention Comparison</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#C9A15A]/10 border border-[#C9A15A]/25 text-[#C9A15A]">Science Backed</span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Cramming Method (No Revisions)</span>
                    <span className="font-bold text-red-400">18% Retained at Day 15</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-red-400 h-full rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Study Tracker (+7, +14 Day Schedules)</span>
                    <span className="font-bold text-[#C9A15A]">84% Retained at Day 15</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#C9A15A] h-full rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#1E2124] text-gray-400 py-12 px-6 md:px-12 border-t border-[#2d3135] text-center z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#C9A15A]" />
            <span className="text-base font-bold text-white tracking-wider">
              Study<span className="text-[#C9A15A]">Tracker</span>
            </span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Study Tracker. Built for serious learners. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
