import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User'
    }
  });

  console.log('Created user:', user.email);

  const invoices = [
    {
      invoiceNumber: 'INV-0001',
      customerName: 'Acme Corporation',
      amount: 1500.00,
      invoiceDate: new Date('2026-01-15'),
      status: 'Paid'
    },
    {
      invoiceNumber: 'INV-0002',
      customerName: 'Tech Solutions Ltd',
      amount: 2750.50,
      invoiceDate: new Date('2026-01-20'),
      status: 'Unpaid'
    },
    {
      invoiceNumber: 'INV-0003',
      customerName: 'Global Services Inc',
      amount: 4200.00,
      invoiceDate: new Date('2026-02-01'),
      status: 'Paid'
    },
    {
      invoiceNumber: 'INV-0004',
      customerName: 'Digital Marketing Co',
      amount: 890.25,
      invoiceDate: new Date('2026-02-05'),
      status: 'Unpaid'
    }
  ];

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: invoice.invoiceNumber },
      update: {},
      create: invoice
    });
  }

  console.log('Created sample invoices');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
