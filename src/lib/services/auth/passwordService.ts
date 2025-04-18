import crypto from "crypto";
import bcrypt from "bcryptjs";
import Mailjet from "node-mailjet";

// --- Password Reset Functions ---

export async function sendForgotPasswordEmail(email: string): Promise<void> {
  console.log("Function called with email:", email);

  const user = await findUserByEmail(email);
  if (!user) {
    console.log("No user found for email:", email);
    return; // Silently fail for security (don’t reveal user existence)
  }

  console.log("User found:", user);

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 3600000; // 1 hour from now

  console.log("Pre reset token, token:", token);
  await saveResetToken(user.user_id, token, expires);
  console.log("Post reset token, saved in database");

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  console.log("Reset URL generated:", resetUrl);

  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY as string,
    process.env.MAILJET_API_SECRET as string
  );

  console.log("Mailjet connected, sending email...");

  await mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL as string,
            Name: "DentalConnect",
          },
          To: [{ Email: email }],
          Subject: "Reset Your Password",
          TextPart: `Please click the following link to reset your password: ${resetUrl}`,
          HTMLPart: `<p>Please click the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
        },
      ],
    });
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

// Find a user by email
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
  if (json.errors) throw new Error("Failed to fetch user");
  if (json.data.users && json.data.users.length > 0) {
    return json.data.users[0];
  }
  return null;
}

// Update the user's password
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
  if (json.errors || json.data.update_users.affected_rows === 0) {
    throw new Error("Failed to update password");
  }
}

// Save reset token to database
async function saveResetToken(userId: string, token: string, expires: number): Promise<void> {
  const mutation = `
    mutation SaveResetToken($userId: uuid!, $token: String!, $expires: bigint!) {
      insert_password_reset_tokens_one(object: { user_id: $userId, token: $token, expires: $expires }) {
        token_id
      }
    }
  `;
  const res = await fetch(process.env.HASURA_GRAPHQL_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET as string,
    },
    body: JSON.stringify({ query: mutation, variables: { userId, token, expires } }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error("Failed to save reset token: " + JSON.stringify(json.errors));
  }
}

// Find reset token in database
async function findResetToken(token: string): Promise<{ userId: string; expires: number } | null> {
  const query = `
    query FindResetToken($token: String!) {
      password_reset_tokens(where: { token: { _eq: $token } }) {
        user_id
        expires
      }
    }
  `;
  const res = await fetch(process.env.HASURA_GRAPHQL_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET as string,
    },
    body: JSON.stringify({ query, variables: { token } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error("Failed to fetch reset token");
  if (json.data.password_reset_tokens && json.data.password_reset_tokens.length > 0) {
    return {
      userId: json.data.password_reset_tokens[0].gituser_id,
      expires: json.data.password_reset_tokens[0].expires,
    };
  }
  return null;
}

// Delete reset token from database
async function deleteResetToken(token: string): Promise<void> {
  const mutation = `
    mutation DeleteResetToken($token: String!) {
      delete_password_reset_tokens(where: { token: { _eq: $token } }) {
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
    body: JSON.stringify({ query: mutation, variables: { token } }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error("Failed to delete reset token");
  }
}