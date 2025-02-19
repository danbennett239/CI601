import crypto from "crypto";
import { insertInviteToken } from "./tokenService";
import { sendEmail } from "../emailService";

export async function inviteUser(email: string, practiceId: string): Promise<void> {
  // 1) Generate token + expiry
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  // 2) Save in DB
  await insertInviteToken(email, token, practiceId, expiresAt);

  // 3) Create link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const inviteLink = `${baseUrl}/signin/invited?token=${token}`;

  // 4) Send email
  await sendEmail({
    to: email,
    subject: "You have been invited to join a practice",
    textPart: `You've been invited. Complete your sign-up: ${inviteLink}`,
    htmlPart: `<p>You've been invited. Complete your sign-up here:</p><a href="${inviteLink}">${inviteLink}</a>`,
  });
}
