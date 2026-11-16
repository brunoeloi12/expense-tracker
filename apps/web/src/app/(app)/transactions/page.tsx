'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionForm from '@/components/transactions/TransactionForm';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }
};

export default function TransactionsPage() {
  const { data: transactions, isLoading, error } = useTransactions();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-12 pb-24">
      <motion.section variants={itemVariants} className="flex justify-between items-end border-b border-[var(--color-paper-dim)] pb-6">
        <div>
          <h2 className="text-[var(--text-mega)] font-serif tracking-tight text-[var(--color-ink)] leading-none">Lançamentos</h2>
          <p className="text-[var(--text-ui)] text-[var(--color-graphite)] mt-2">Histórico completo das suas movimentações</p>
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        {isLoading && <p className="text-[var(--color-graphite)]">Carregando movimentações...</p>}
        {error && <p className="text-red-500">Erro ao carregar movimentações.</p>}
        
        <div className="flex flex-col">
          {transactions?.map((tx: any) => (
            <div 
              key={tx.id} 
              className="group flex flex-col md:flex-row md:items-center justify-between py-5 border-b border-[var(--color-paper-dim)] hover:bg-[rgba(0,0,0,0.02)] transition-colors px-2 md:-mx-4 md:px-4 rounded-sm cursor-pointer gap-2 md:gap-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-8 w-full">
                <span className="text-[var(--color-ink)] font-medium md:w-64 truncate text-lg md:text-base">{tx.description}</span>
                <span className="text-[var(--text-label)] text-[var(--color-graphite)] md:w-32">{tx.category?.name || 'Geral'}</span>
                <span className="text-[var(--text-label)] text-[var(--color-graphite)] md:w-40 truncate">{tx.account?.name}</span>
                <span className="text-[var(--text-label)] text-[var(--color-graphite)] flex-1">
                  {new Date(tx.occurredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <span className={`text-xl md:text-base tabular-nums text-right font-medium ${tx.amountCents > 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-ink)]'}`}>
                {tx.amountCents > 0 ? '+' : ''}{(tx.amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
