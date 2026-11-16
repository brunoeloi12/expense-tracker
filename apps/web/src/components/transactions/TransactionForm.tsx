'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';

export default function TransactionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();

  // Set default account/category when data loads
  React.useEffect(() => {
    if (accounts?.length > 0 && !accountId) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  React.useEffect(() => {
    if (categories?.length > 0 && !categoryId) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !accountId || !categoryId) return;

    // Convert string to float, then to cents.
    let amountFloat = parseFloat(amount.replace(',', '.'));
    if (isNaN(amountFloat)) return;
    
    let amountCents = Math.round(amountFloat * 100);
    // Apply sign
    if (type === 'EXPENSE' && amountCents > 0) amountCents = -amountCents;
    if (type === 'INCOME' && amountCents < 0) amountCents = Math.abs(amountCents);

    createMutation.mutate(
      {
        accountId,
        categoryId,
        type,
        amountCents,
        description,
        occurredAt: new Date(date).toISOString(),
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setAmount('');
          setDescription('');
        },
      }
    );
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-12 h-12 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-shadow"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-zinc-950 rounded-2xl p-8 border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-normal tracking-tight text-white mb-8">Nova Transação</h2>
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Valor (R$)</label>
                  <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" required className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-lg focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none transition-all text-white font-mono placeholder:text-zinc-700" />
                </div>
                
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Descrição</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex: Mercado" required className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-lg focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none transition-all text-white placeholder:text-zinc-700" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Tipo</label>
                    <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-lg focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none text-white appearance-none">
                      <option value="EXPENSE">Despesa</option>
                      <option value="INCOME">Receita</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Data</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-lg focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Conta</label>
                    <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-lg focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none text-white appearance-none">
                      {accounts?.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">Categoria</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-lg focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none text-white appearance-none">
                      {categories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsOpen(false)} disabled={createMutation.isPending} className="flex-1 px-4 py-3 text-zinc-300 bg-transparent border border-white/10 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors uppercase tracking-widest disabled:opacity-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-3 text-black bg-white hover:bg-zinc-200 rounded-lg text-sm font-medium transition-colors uppercase tracking-widest disabled:opacity-50">
                    {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
