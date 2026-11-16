'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { SSEProvider } from '@/components/providers/SSEProvider';
import { AnimatePresence, motion } from 'framer-motion';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SSEProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-paper)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 bg-[var(--color-paper)] shadow-2xl md:hidden"
              >
                <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="md:hidden border-b border-[var(--color-paper-dim)] py-4 px-6 flex items-center justify-between sticky top-0 bg-[var(--color-paper)] z-30">
            <h2 className="font-serif text-2xl tracking-tight">Fintec</h2>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-[var(--color-graphite)] hover:text-[var(--color-ink)] transition-colors p-2 -mr-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </header>
          
          <div className="flex-1 px-6 py-8 md:p-16 max-w-4xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SSEProvider>
  );
}
