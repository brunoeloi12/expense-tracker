import { z } from 'zod';

export const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE']);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const MoneySchema = z.number().int();

// Auth Schemas
export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string()
    .email('E-mail inválido')
    .max(255, 'E-mail deve ter no máximo 255 caracteres')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número',
    ),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido').max(255).toLowerCase().trim(),
  password: z.string().min(1, 'Senha é obrigatória').max(128),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Account Schemas
export const CreateAccountSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome da conta deve ter no mínimo 2 caracteres')
    .max(100, 'Nome da conta deve ter no máximo 100 caracteres')
    .trim(),
});
export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;

export const UpdateAccountSchema = CreateAccountSchema.partial();
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;

// Category Schemas
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Nome da categoria deve ter no mínimo 2 caracteres')
    .max(100, 'Nome da categoria deve ter no máximo 100 caracteres')
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser um código hex válido (ex: #ff4b4b)')
    .optional(),
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// Transaction Schemas
export const CreateTransactionSchema = z.object({
  accountId: z.string().uuid('ID de conta inválido'),
  categoryId: z.string().uuid('ID de categoria inválido'),
  type: TransactionTypeEnum,
  amountCents: MoneySchema.refine(
    (val) => val !== 0,
    'O valor da transação não pode ser zero',
  ),
  description: z
    .string()
    .min(2, 'A descrição deve ter no mínimo 2 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .trim(),
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
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'Data inicial deve ser anterior à data final' },
);
export type TransactionFiltersInput = z.infer<typeof TransactionFiltersSchema>;
