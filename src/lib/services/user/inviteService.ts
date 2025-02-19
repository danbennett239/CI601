import crypto from "crypto";
import { insertInviteToken, getInviteToken } from "./tokenService";
import { sendInviteEmail } from "../email/emailService";
import { checkUserExists } from "./userService";

export async function inviteUser(email: string, practiceId: string): Promise<void> {
  const userExists = await checkUserExists(email);
  if (userExists) {
    throw new Error("A user with this email already exists.");
  }
  
  const token = generateInviteToken();
  const expiresAt = getExpiryDate();

  await insertInviteToken(email, token, practiceId, expiresAt);
  await sendInviteEmail(email, token);
}

export async function validateInvite(token: string) {
  const invite = await getInviteToken(token);
  if (!invite) {
    throw new Error("Invalid or already used invitation.");
  }

  const expires = new Date(invite.expires_at);
  if (Date.now() > expires.getTime()) {
    throw new Error("Invitation link has expired.");
  }

  return invite;
} 

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getExpiryDate(): Date {
  return new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
}
