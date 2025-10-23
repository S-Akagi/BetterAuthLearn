import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrganizationInvitation(params: {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}) {
  const { email, invitedByUsername, invitedByEmail, teamName, inviteLink } =
    params;
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
    to: [email],
    subject: 'You are invited to join ' + teamName,
    html:
      '<p>Hi,</p>' +
      `<p>${invitedByUsername} (${invitedByEmail}) has invited you to join the organization "${teamName}".</p>` +
      `<p>Please click the link below to accept the invitation:</p>` +
      `<p><a href="${inviteLink}">Accept Invitation</a></p>` +
      '<p>If you did not expect this invitation, you can safely ignore this email.</p>' +
      '<p>Best regards,<br/>The Team</p>',
  });

  if (error) {
    return console.error({ error });
  }
}
