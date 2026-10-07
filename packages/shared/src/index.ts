import { z } from 'zod';

export const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE']);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const MoneySchema = z.number().int().nonnegative();

// Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Account Schemas
export const CreateAccountSchema = z.object({
  name: z.string().min(2, 'Nome da conta deve ter no mínimo 2 caracteres'),
});
export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;

export const UpdateAccountSchema = CreateAccountSchema.partial();
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;

// Category Schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Nome da categoria deve ter no mínimo 2 caracteres'),
  color: z.string().optional(),
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// Transaction Schemas
export const CreateTransactionSchema = z.object({
  accountId: z.string().uuid('ID de conta inválido'),
  categoryId: z.string().uuid('ID de categoria inválido'),
  type: TransactionTypeEnum,
  amountCents: MoneySchema,
  description: z.string().min(2, 'A descrição deve ter no mínimo 2 caracteres'),
  occurredAt: z.coerce.date(),
});
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = CreateTransactionSchema.partial();
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;

// Shared Queries
export const TransactionFiltersSchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
export type TransactionFiltersInput = z.infer<typeof TransactionFiltersSchema>;
