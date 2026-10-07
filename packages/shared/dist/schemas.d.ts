import { z } from 'zod';
export declare const TransactionTypeEnum: z.ZodEnum<["INCOME", "EXPENSE"]>;
export type TransactionType = z.infer<typeof TransactionTypeEnum>;
export declare const MoneySchema: z.ZodNumber;
export declare const RegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
}, {
    name: string;
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const CreateAccountSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export declare const UpdateAccountSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
}, {
    name?: string | undefined;
}>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;
export declare const CreateCategorySchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    color?: string | undefined;
}, {
    name: string;
    color?: string | undefined;
}>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export declare const UpdateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    color?: string | undefined;
}, {
    name?: string | undefined;
    color?: string | undefined;
}>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
//# sourceMappingURL=schemas.d.ts.map