import { hashPassword } from '../lib/auth-otp';
import { prisma } from '../lib/db';

async function main() {
  const demoPassword = hashPassword('demo1234');
  const adminPassword = hashPassword('admin1234');

  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { passwordHash: demoPassword },
    create: {
      name: 'Demo Customer',
      email: 'demo@example.com',
      phone: '9999999999',
      role: 'CUSTOMER',
      passwordHash: demoPassword,
      addresses: {
        create: {
          fullName: 'Demo Customer',
          phone: '9999999999',
          line1: 'MG Road',
          line2: 'Apartment 12',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001'
        }
      }
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@murgdur.com' },
    update: { passwordHash: adminPassword, role: 'ADMIN' },
    create: {
      name: 'Murgdur Admin',
      email: 'admin@murgdur.com',
      phone: '9999999999',
      role: 'ADMIN',
      passwordHash: adminPassword
    }
  });

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.create({
      data: {
        slug: 'classic-watch',
        name: 'Classic Watch',
        category: 'WATCHES',
        description: 'A timeless classic watch',
        priceInr: 350000,
        images: [],
        variants: {
          create: [
            { color: 'Black', size: 'M', quantity: 10 },
            { color: 'Silver', size: 'M', quantity: 5 }
          ]
        }
      }
    });

    await prisma.product.create({
      data: {
        slug: 'leather-bag',
        name: 'Leather Bag',
        category: 'HANDBAG',
        description: 'Premium leather handbag',
        priceInr: 550000,
        images: [],
        variants: { create: [{ color: 'Tan', size: 'One', quantity: 7 }] }
      }
    });
  }

  console.log('Seeded demo users and sample products.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
