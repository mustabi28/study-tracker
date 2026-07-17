'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  Users, 
  Settings, 
  Menu, 
  X,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Revisions', href: '/revisions', icon: BookOpen },
  { label: 'Statistics', href: '/statistics', icon: BarChart3 },
  { label: 'Friends', href: '/friends', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-[#1E2124] text-white border-r border-[#2d3135] z-30">
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-[#2d3135]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-[#C9A15A]" />
            <span className="text-xl font-bold tracking-wider">
              Study<span className="text-[#C9A15A]">Tracker</span>
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'text-white font-semibold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {/* Active Background Glow */}
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-[#C9A15A]/20 to-[#C9A15A]/5 rounded-xl border-l-4 border-[#C9A15A]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon className={`h-5 w-5 z-10 transition-colors duration-300 ${
                  isActive ? 'text-[#C9A15A]' : 'group-hover:text-white'
                }`} />
                <span className="z-10 text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info / Profile Section */}
        <div className="p-4 border-t border-[#2d3135] bg-[#1a1d20]/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserButton />
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                {user?.username || user?.firstName || 'Student'}
              </span>
              <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header / Navigation */}
      <header className="md:hidden flex h-16 items-center justify-between px-6 bg-[#1E2124] text-white border-b border-[#2d3135] fixed top-0 left-0 right-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-[#C9A15A]" />
          <span className="text-lg font-bold tracking-wider">
            Study<span className="text-[#C9A15A]">Tracker</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <UserButton />
          <button 
            onClick={toggleMobileMenu}
            className="p-1 rounded-lg text-gray-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#1E2124] text-white z-50 p-6 flex flex-col justify-between md:hidden border-r border-[#2d3135]"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#2d3135] mb-6">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-7 w-7 text-[#C9A15A]" />
                    <span className="text-lg font-bold tracking-wider">
                      Study<span className="text-[#C9A15A]">Tracker</span>
                    </span>
                  </div>
                  <button 
                    onClick={toggleMobileMenu}
                    className="p-1 rounded-lg text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={toggleMobileMenu}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                          isActive 
                            ? 'text-white font-semibold' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A15A]/20 to-[#C9A15A]/5 rounded-xl border-l-4 border-[#C9A15A]" />
                        )}
                        <Icon className={`h-5 w-5 z-10 ${isActive ? 'text-[#C9A15A]' : ''}`} />
                        <span className="z-10 text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-[#2d3135] flex items-center gap-3">
                <UserButton />
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-xs font-semibold truncate max-w-[120px]">
                    {user?.username || user?.firstName || 'Student'}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
