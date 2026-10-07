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
