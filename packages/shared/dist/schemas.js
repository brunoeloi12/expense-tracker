"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategorySchema = exports.CreateCategorySchema = exports.UpdateAccountSchema = exports.CreateAccountSchema = exports.LoginSchema = exports.RegisterSchema = exports.MoneySchema = exports.TransactionTypeEnum = void 0;
var zod_1 = require("zod");
exports.TransactionTypeEnum = zod_1.z.enum(['INCOME', 'EXPENSE']);
exports.MoneySchema = zod_1.z.number().int().nonnegative();
// Auth Schemas
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});
// Account Schemas
exports.CreateAccountSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome da conta deve ter no mínimo 2 caracteres'),
});
exports.UpdateAccountSchema = exports.CreateAccountSchema.partial();
// Category Schemas
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome da categoria deve ter no mínimo 2 caracteres'),
    color: zod_1.z.string().optional(),
});
exports.UpdateCategorySchema = exports.CreateCategorySchema.partial();
