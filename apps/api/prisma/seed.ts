import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CoachOS database...');

  // 1. Create default subscription plans
  const aarambhPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Aarambh (Entry)',
      maxStudents: 40,
      maxStaff: 2,
      maxBatches: 3,
      maxStorageMb: 250,
      priceMonthly: 99,
      featuresJson: { whatsappFree: 0, analytics: 'basic' },
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Aarambh (Entry)',
      maxStudents: 40,
      maxStaff: 2,
      maxBatches: 3,
      maxStorageMb: 250,
      priceMonthly: 99,
      featuresJson: { whatsappFree: 0, analytics: 'basic' },
    },
  });

  const pragatiPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {
      name: 'Pragati (Pro)',
      maxStudents: 300,
      maxStaff: 10,
      maxBatches: 10,
      maxStorageMb: 5000,
      priceMonthly: 499,
      featuresJson: { whatsappFree: 500, analytics: 'advanced' },
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Pragati (Pro)',
      maxStudents: 300,
      maxStaff: 10,
      maxBatches: 10,
      maxStorageMb: 5000,
      priceMonthly: 499,
      featuresJson: { whatsappFree: 500, analytics: 'advanced' },
    },
  });

  const utsavPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {
      name: 'Utsav (Enterprise)',
      maxStudents: 100000, // unlimited-ish
      maxStaff: 1000,
      maxBatches: 1000,
      maxStorageMb: 50000,
      priceMonthly: 1999,
      featuresJson: { whatsappFree: 2000, analytics: 'multi-institute' },
    },
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Utsav (Enterprise)',
      maxStudents: 100000,
      maxStaff: 1000,
      maxBatches: 1000,
      maxStorageMb: 50000,
      priceMonthly: 1999,
      featuresJson: { whatsappFree: 2000, analytics: 'multi-institute' },
    },
  });

  console.log('✅ Plans created:', [aarambhPlan.name, pragatiPlan.name, utsavPlan.name].join(', '));

  // 2. Create Super Admin user (instituteId is null — super admin is platform-level)
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@vidyaplus.in';
  const superAdminPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'Admin@2026', 12);

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: superAdminEmail, role: 'super_admin' },
  });

  let superAdmin;
  if (existingSuperAdmin) {
    superAdmin = existingSuperAdmin;
    console.log(`✅ Super Admin already exists: ${superAdmin.email}`);
  } else {
    superAdmin = await prisma.user.create({
      data: {
        name: 'VidyaPlus Admin',
        phone: '9999999999',
        email: superAdminEmail,
        passwordHash: superAdminPassword,
        role: 'super_admin',
        permissionsJson: [],
        status: 'active',
        // instituteId is null — super admin belongs to no institute
      },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email} (phone: ${superAdmin.phone})`);
  }

  // 3. Create a demo institute for development
  const demoInstitute = await prisma.institute.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Coaching Center',
      subdomain: 'demo',
      phone: '9876543210',
      email: 'demo@coachOS.in',
      address: '123 Education Street, Pune, Maharashtra',
      planId: aarambhPlan.id,
      academicYear: '2026-2027',
      status: 'active',
      setupCompleted: true,
    },
  });

  console.log(`✅ Demo institute created: ${demoInstitute.name}`);

  // 4. Create demo Owner for the institute
  const ownerPassword = await bcrypt.hash('Owner@2026', 12);

  const existingOwner = await prisma.user.findFirst({
    where: { instituteId: demoInstitute.id, role: 'owner' },
  });

  let demoOwner;
  if (existingOwner) {
    demoOwner = existingOwner;
    console.log(`✅ Demo Owner already exists: ${demoOwner.name}`);
  } else {
    demoOwner = await prisma.user.create({
      data: {
        instituteId: demoInstitute.id,
        name: 'Rahul Sharma',
        phone: '9876543210',
        email: 'owner@demo.coachOS.in',
        passwordHash: ownerPassword,
        role: 'owner',
        permissionsJson: [],
        status: 'active',
      },
    });
    console.log(`✅ Demo Owner created: ${demoOwner.name} (phone: ${demoOwner.phone}, password: Owner@2026)`);
  }

  console.log('\n🎉 Seed complete! You can now login with:');
  console.log('  Super Admin: admin@vidyaplus.in / Admin@2026');
  console.log('  Demo Owner:  9876543210 / Owner@2026');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
