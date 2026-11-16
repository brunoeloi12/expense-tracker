'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionForm from '@/components/transactions/TransactionForm';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  const mainRef = useRef<HTMLSpanElement>(null);
  const centsRef = useRef<HTMLSpanElement>(null);
  const { data: transactions, isLoading, error } = useTransactions();

  // Memoize computed values
  const { balanceCents, totalIncomeCents, totalExpenseCents } = useMemo(() => {
    if (!transactions) return { balanceCents: 0, totalIncomeCents: 0, totalExpenseCents: 0 };
    
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.amountCents > 0) income += tx.amountCents;
      else expense += tx.amountCents;
    }
    return {
      balanceCents: income + expense,
      totalIncomeCents: income,
      totalExpenseCents: expense,
    };
  }, [transactions]);

  useEffect(() => {
    const obj = { val: 0 };
    if (mainRef.current && centsRef.current && !isLoading) {
      gsap.to(obj, {
        val: balanceCents / 100,
        duration: 2,
        ease: 'power3.out',
        onUpdate: () => {
          if (mainRef.current && centsRef.current) {
            const reais = Math.floor(obj.val);
            const cents = Math.round((obj.val - reais) * 100).toString().padStart(2, '0');
            mainRef.current.textContent = `R$ ${reais.toLocaleString('pt-BR')}`;
            centsRef.current.textContent = `,${cents}`;
          }
        }
      });
    }
  }, [balanceCents, isLoading]);

  // Memoize chart data
  const chartData = useMemo(() => {
    if (!transactions) return null;
    
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    // Build a map for O(n) instead of O(n*m)
    const volumeMap = new Map<string, number>();
    for (const tx of transactions) {
      const dayStr = new Date(tx.occurredAt).toISOString().split('T')[0];
      volumeMap.set(dayStr, (volumeMap.get(dayStr) || 0) + Math.abs(tx.amountCents));
    }

    const volumeByDay = days.map(day => {
      const dayStr = day.toISOString().split('T')[0];
      return volumeMap.get(dayStr) || 0;
    });

    const maxVolume = Math.max(...volumeByDay, 1000);
    return { days, volumeByDay, maxVolume };
  }, [transactions]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-24 pb-24"
    >
      {/* Saldo Principal */}
      <motion.section variants={itemVariants}>
        <h2 className="text-[var(--text-ui)] text-[var(--color-graphite)] mb-2">Quanto sobrou até agora</h2>
        <div className="font-serif text-[var(--text-mega)] leading-none tracking-tight">
          <span ref={mainRef}>R$ 0</span>
          <span ref={centsRef} className="text-[var(--text-title)] text-[var(--color-graphite)] ml-1">,00</span>
        </div>
        <div className="mt-8 flex gap-12 text-[var(--text-ui)] text-[var(--color-graphite)] border-t border-[var(--color-paper-dim)] pt-6">
          <div>
            <span className="block mb-1">Entrou neste mês</span>
            <span className="text-[var(--color-positive)] tabular-nums">
              {formatCurrency(totalIncomeCents)}
            </span>
          </div>
          <div>
            <span className="block mb-1">Saiu até agora</span>
            <span className="text-[var(--color-negative)] tabular-nums">
              {formatCurrency(totalExpenseCents)}
            </span>
          </div>
        </div>
      </motion.section>

      {/* Como seu mês foi andando */}
      <motion.section variants={itemVariants}>
        <h2 className="text-[var(--text-ui)] text-[var(--color-graphite)] mb-6 border-b border-[var(--color-paper-dim)] pb-2">
          Movimentação Diária (Últimos 30 dias)
        </h2>
        
        <div className="h-32 flex items-end gap-1">
          {chartData?.days.map((day, i) => {
            const volume = chartData.volumeByDay[i];
            const height = Math.max(4, (volume / chartData.maxVolume) * 100);
            const isToday = i === 29;
            
            return (
              <motion.div 
                key={day.toISOString()} 
                initial={{ height: '0%' }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 1.5, delay: i * 0.02, ease: [0.2, 0.8, 0.2, 1] }}
                title={`${day.toLocaleDateString('pt-BR')}: ${formatCurrency(volume)}`}
                className={`flex-1 rounded-t-sm transition-colors hover:bg-[var(--color-accent)] ${isToday ? 'bg-[var(--color-ink)]' : 'bg-[var(--color-paper-dim)]'}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[var(--text-label)] text-[var(--color-graphite)] mt-2">
          <span>{(() => {
            const d = new Date();
            d.setDate(d.getDate() - 29);
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
          })()}</span>
          <span>Hoje</span>
        </div>
      </motion.section>

      {/* Últimas movimentações */}
      <motion.section variants={itemVariants}>
        <h2 className="text-[var(--text-ui)] text-[var(--color-graphite)] mb-2 border-b border-[var(--color-paper-dim)] pb-2 flex justify-between">
          <span>Últimas movimentações</span>
          <button className="hover:text-[var(--color-ink)] transition-colors">Ver todas</button>
        </h2>
        
        {isLoading && <p className="py-4 text-[var(--color-graphite)]">Carregando movimentações...</p>}
        {error && <p className="py-4 text-red-500">Erro ao carregar movimentações.</p>}
        
        <div className="flex flex-col">
          {transactions?.map((tx: any) => (
            <div 
              key={tx.id} 
              className="group flex items-baseline justify-between py-4 border-b border-[var(--color-paper-dim)] hover:bg-[rgba(0,0,0,0.02)] transition-colors -mx-4 px-4 rounded-sm cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 w-full">
                <span className="text-[var(--color-ink)] w-48 font-medium truncate">{tx.description}</span>
                <span className="text-[var(--text-label)] text-[var(--color-graphite)] w-32">{tx.category?.name || 'Geral'}</span>
                <span className="text-[var(--text-label)] text-[var(--color-graphite)] flex-1">
                  {new Date(tx.occurredAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <span className={`tabular-nums text-right ${tx.amountCents > 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-ink)]'}`}>
                {tx.amountCents > 0 ? '+' : ''}{formatCurrency(tx.amountCents)}
              </span>
            </div>
          ))}
          {transactions?.length === 0 && !isLoading && (
            <p className="py-4 text-[var(--color-graphite)]">Nenhuma movimentação encontrada.</p>
          )}
        </div>
      </motion.section>

      <TransactionForm />
    </motion.div>
  );
}
