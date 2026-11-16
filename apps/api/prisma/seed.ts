import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:rootpassword@localhost:5432/fincontrol?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash('Teste123@');

  const user = await prisma.user.create({
    data: {
      name: 'João Seed',
      email: 'joao@seed.com',
      passwordHash,
    },
  });

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Nubank',
    },
  });

  const catFood = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Alimentação',
      color: '#ff4b4b',
    },
  });

  const catSalary = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Salário',
      color: '#10b981',
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        accountId: account.id,
        categoryId: catFood.id,
        amountCents: -5000, // -R$ 50,00
        description: 'Padaria Estrela',
        occurredAt: new Date(),
        type: 'EXPENSE',
      },
      {
        userId: user.id,
        accountId: account.id,
        categoryId: catSalary.id,
        amountCents: 800000, // R$ 8.000,00
        description: 'Salário Mensal',
        occurredAt: new Date(new Date().setDate(1)), // dia 1
        type: 'INCOME',
      },
      {
        userId: user.id,
        accountId: account.id,
        categoryId: catFood.id,
        amountCents: -12500, // -R$ 125,00
        description: 'Mercado',
        occurredAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        type: 'EXPENSE',
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
