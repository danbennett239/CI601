// /lib/services/passwordService.ts
import crypto from "crypto";
import bcrypt from "bcryptjs";

// --- Password Reset Functions ---

export async function sendForgotPasswordEmail(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) {
    // Do not reveal if the email exists.
    return;
  }
  // Generate a secure token valid for 1 hour.
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 3600000;
  console.log('Pre reset token');
  await saveResetToken(user.user_id, token, expires); // persist the token
  console.log('Post reset token');

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  const Mailjet = require('node-mailjet');
  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY as string,
    process.env.MAILJET_API_SECRET as string
  );

  const response = await mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL as string,
            Name: "Tempname Dentist",
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: "Reset Your Password",
          TextPart: `Please click the following link to reset your password: ${resetUrl}`,
          HTMLPart: `<p>Please click the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
        },
      ],
    });

    return response;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenData = await findResetToken(token);
  if (!tokenData || tokenData.expires < Date.now()) {
    throw new Error("Invalid or expired token");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(tokenData.userId, hashedPassword);
  await deleteResetToken(token);
}

// --- Database Query Functions using Hasura ---

// Find a user by email.
export async function findUserByEmail(email: string): Promise<{ user_id: string; email: string; password: string } | null> {
  const query = `
    query FindUserByEmail($email: String!) {
      users(where: { email: { _eq: $email } }) {
        user_id
        email
        password
      }
    }
  `;

  const res = await fetch(process.env.HASURA_GRAPHQL_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET as string,
    },
    body: JSON.stringify({ query, variables: { email } }),
  });
  const json = await res.json();
  if (json.data.user && json.data.user.length > 0) {
    return json.data.user[0];
  }
  return null;
}

// Update the user's password.
export async function updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
  const mutation = `
    mutation UpdateUserPassword($userId: uuid!, $password: String!) {
      update_users(where: { user_id: { _eq: $userId } }, _set: { password: $password }) {
        affected_rows
      }
    }
  `;
  const res = await fetch(process.env.HASURA_GRAPHQL_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET as string,
    },
    body: JSON.stringify({ query: mutation, variables: { userId, password: hashedPassword } }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error("Failed to update password");
  }
}

// --- In-Memory Reset Token Storage ---
// (For production, store tokens in your database.)

const resetTokenStore: Record<string, { userId: string; expires: number }> = {};

async function saveResetToken(userId: string, token: string, expires: number): Promise<void> {
  resetTokenStore[token] = { userId, expires };
}

async function findResetToken(token: string): Promise<{ userId: string; expires: number } | null> {
  return resetTokenStore[token] || null;
}

async function deleteResetToken(token: string): Promise<void> {
  delete resetTokenStore[token];
}
