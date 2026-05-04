import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CoachOS database...');

  // 1. Create default subscription plans
  const trialPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Trial',
      maxStudents: 50,
      maxStaff: 5,
      maxStorageMb: 500,
      priceMonthly: 0,
      featuresJson: { trial: true, durationDays: 90 },
    },
  });

  const starterPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Starter',
      maxStudents: 200,
      maxStaff: 10,
      maxStorageMb: 2000,
      priceMonthly: 2500,
      featuresJson: { onlinePayments: false, advancedReports: false },
    },
  });

  const growthPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Growth',
      maxStudents: 1000,
      maxStaff: 25,
      maxStorageMb: 10000,
      priceMonthly: 7500,
      featuresJson: { onlinePayments: true, advancedReports: true },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Pro',
      maxStudents: 5000,
      maxStaff: 50,
      maxStorageMb: 50000,
      priceMonthly: 20000,
      featuresJson: { onlinePayments: true, advancedReports: true, multiBranch: true, whitelabel: false },
    },
  });

  console.log('✅ Plans created:', [trialPlan.name, starterPlan.name, growthPlan.name, proPlan.name].join(', '));

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
      planId: starterPlan.id,
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
