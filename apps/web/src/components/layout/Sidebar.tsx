'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Resumo' },
  { href: '/transactions', label: 'Lançamentos' },
  { href: '/accounts', label: 'Contas' },
  { href: '/categories', label: 'Categorias' },
];

interface SidebarProps {
  onNavClick?: () => void;
}

export default function Sidebar({ onNavClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r border-[var(--color-paper-dim)] py-16 px-8 shrink-0">
      <div className="mb-16">
        <h1 className="font-serif text-3xl tracking-tight text-[var(--color-ink)]">
          Fintec.
        </h1>
      </div>

      <nav className="flex-1 space-y-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={onNavClick}
              className={`block text-[var(--text-ui)] transition-colors ${
                isActive 
                  ? 'text-[var(--color-ink)] font-medium' 
                  : 'text-[var(--color-graphite)] hover:text-[var(--color-ink)]'
              }`}
            >
              <div className="flex items-center gap-2">
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink)] shrink-0" />}
                <span className={isActive ? '' : 'pl-3.5'}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-[var(--color-paper-dim)]">
        <div className="text-[var(--text-label)] text-[var(--color-graphite)]">
          <div>Autônomo</div>
          <div className="text-[var(--color-ink)] font-medium mt-0.5">Bruno Eloi</div>
        </div>
      </div>
    </aside>
  );
}
