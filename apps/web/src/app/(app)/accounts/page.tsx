'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccounts, useCreateAccount, useDeleteAccount } from '@/hooks/useAccounts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }
};

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const createMutation = useCreateAccount();
  const deleteMutation = useDeleteAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName) return;
    createMutation.mutate({ name: newAccountName }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setNewAccountName('');
      }
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-12 pb-24">
      <motion.section variants={itemVariants} className="flex justify-between items-end border-b border-[var(--color-paper-dim)] pb-6">
        <div>
          <h2 className="text-[var(--text-mega)] font-serif tracking-tight text-[var(--color-ink)] leading-none">Contas</h2>
          <p className="text-[var(--text-ui)] text-[var(--color-graphite)] mt-2">Gerencie suas carteiras e bancos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-black rounded-lg text-sm font-medium transition-colors uppercase tracking-widest"
        >
          Nova Conta
        </button>
      </motion.section>

      <motion.section variants={itemVariants}>
        {isLoading && <p className="text-[var(--color-graphite)]">Carregando contas...</p>}
        {!isLoading && accounts?.length === 0 && <p className="text-[var(--color-graphite)]">Nenhuma conta cadastrada.</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts?.map((acc: any) => (
            <div key={acc.id} className="p-6 border border-[var(--color-paper-dim)] rounded-2xl bg-[var(--color-paper)] hover:border-[var(--color-graphite)] transition-colors group relative">
              <h3 className="text-xl font-medium text-[var(--color-ink)]">{acc.name}</h3>
              <p className="text-[var(--color-graphite)] mt-2 text-sm">Cadastrada em {new Date(acc.createdAt || Date.now()).toLocaleDateString('pt-BR')}</p>
              
              <button 
                onClick={() => {
                  if (confirm('Deseja realmente excluir esta conta? Isso pode afetar suas transações.')) {
                    deleteMutation.mutate(acc.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-md bg-[var(--color-paper)] rounded-2xl p-8 border border-[var(--color-paper-dim)] shadow-2xl">
              <h2 className="text-xl font-medium tracking-tight text-[var(--color-ink)] mb-8">Criar Conta</h2>
              <form className="space-y-5" onSubmit={handleCreate}>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-graphite)] mb-2">Nome da Conta</label>
                  <input type="text" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="ex: Nubank, Carteira..." required className="w-full px-4 py-3 bg-[var(--color-paper)] border border-[var(--color-paper-dim)] rounded-lg focus:ring-1 focus:ring-[var(--color-ink)] focus:border-[var(--color-ink)] outline-none transition-all text-[var(--color-ink)] placeholder:text-[var(--color-graphite)]" />
                </div>
                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={createMutation.isPending} className="flex-1 px-4 py-3 text-[var(--color-graphite)] bg-transparent border border-[var(--color-paper-dim)] hover:bg-[var(--color-paper-dim)] rounded-lg text-sm font-medium transition-colors uppercase tracking-widest disabled:opacity-50">Cancelar</button>
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-3 text-[var(--color-paper)] bg-[var(--color-ink)] hover:bg-black rounded-lg text-sm font-medium transition-colors uppercase tracking-widest disabled:opacity-50">{createMutation.isPending ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
