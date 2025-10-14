import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { schema } from '../db/schema';
import { db } from '@/db';
import 'dotenv/config';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }),
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') || [
    'http://localhost:5173',
  ],
  emailAndPassword: { enabled: true, disableSignUp: false },
});
