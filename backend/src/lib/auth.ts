import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { schema } from '../db/schema';
import { db } from '@/db';
import 'dotenv/config';
import { organization } from 'better-auth/plugins';
import { sendOrganizationInvitation } from './email';

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
  plugins: [
    organization({
      // eslint-disable-next-line @typescript-eslint/require-await
      async sendInvitationEmail(data) {
        const inviteLink = `http://localhost:5173/${data.id}`;
        void sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        });
      },
    }),
  ],
});
