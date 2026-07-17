import { auth } from '@clerk/nextjs/server';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Repeating Dotted Triangle Background Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 20 L20 60 L60 60 Z' fill='none' stroke='%23C9A15A' stroke-width='2' stroke-dasharray='4,6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Persistent Left Sidebar (Collapses/Drawer on mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen pt-16 md:pt-0 md:pl-64 z-10 w-full">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
