import mongoose from 'mongoose';
import { hashPassword } from 'better-auth/crypto';

import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/models/user.model';
import { Admin } from '@/lib/models/admin.model';
import { ADMIN_ROLES, type AdminEntity } from '@/types/admin.type';

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL ?? 'dimixo6599@anonmart.com')
  .toLowerCase()
  .trim();
// Meets passwordSchema rules (8+ chars, upper, lower, number, special char)
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@1234';
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'pulse_admin';
const ADMIN_FULL_NAME =
  process.env.SEED_ADMIN_FULL_NAME ?? 'Pulse System Admin';
const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE ?? '+94770000000';
const ADMIN_DEPARTMENT = process.env.SEED_ADMIN_DEPARTMENT ?? 'Operations';

function resolveAdminRole(): AdminEntity['role'] {
  const validRoles = Object.values(ADMIN_ROLES) as string[];
  const envRole = process.env.SEED_ADMIN_ROLE;

  if (envRole && validRoles.includes(envRole)) {
    return envRole as AdminEntity['role'];
  }

  // Prefer a super/system admin role if defined in ADMIN_ROLES, otherwise first role
  const preferred = validRoles.find((r) =>
    ['super_admin', 'system_admin', 'admin'].includes(r),
  );

  return (preferred ?? validRoles[0]) as AdminEntity['role'];
}

async function seedAdmin() {
  await connectToDatabase();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB native database handle is not initialized.');
  }

  // 1. Hash password using Better Auth's exact scrypt algorithm
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  // 2. Upsert the core User document (no `password` field set here; Better Auth reads `accounts`)
  const user = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        emailVerified: true,
        role: 'admin',
        isActive: true,
      },
      $setOnInsert: {
        image: null,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  if (!user) {
    throw new Error('Failed to create or retrieve admin user document.');
  }

  // 3. Upsert the Better Auth credential record in `accounts` (matches `usePlural: true`)
  const now = new Date();
  await db.collection('accounts').updateOne(
    {
      userId: user._id,
      providerId: 'credential',
    },
    {
      $set: {
        accountId: user._id.toString(),
        password: hashedPassword,
        updatedAt: now,
      },
      $setOnInsert: {
        userId: user._id,
        providerId: 'credential',
        createdAt: now,
      },
    },
    { upsert: true },
  );

  // 4. Upsert the linked Admin profile using the shared User `_id`
  const adminSubRole = resolveAdminRole();

  await Admin.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        fullName: ADMIN_FULL_NAME,
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
        role: adminSubRole,
        status: 'active',
        department: ADMIN_DEPARTMENT,
      },
      $setOnInsert: {
        _id: user._id,
        lastLoginAt: null,
        actionsLogged: 0,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  console.log('Admin account seeded successfully:');
  console.log(`  User/Admin _id : ${user._id.toString()}`);
  console.log(`  Email          : ${ADMIN_EMAIL}`);
  console.log(`  Password       : ${ADMIN_PASSWORD}`);
  console.log(`  Admin Role     : ${adminSubRole}`);
}

seedAdmin()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Admin seed failed:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
