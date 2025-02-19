const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

export async function getUserById(userId: string) {
  const query = `
    query GetUser($userId: uuid!) {
      users_by_pk(user_id: $userId) {
        user_id
        first_name
        last_name
        email
        role
        practice_id
        created_at
        updated_at
      }
    }
  `;

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query, variables: { userId } }),
    });

    const result = await response.json();
    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error fetching user");
    }

    return result.data.users_by_pk;
  } catch (error: unknown) {
    console.error("Error in getUserById:", error);
    const message = error instanceof Error ? error.message : "Error fetching user";
    throw new Error(message);
  }
}

import { getInviteToken, markInviteAsUsed } from "./tokenService";
import { hashPassword } from "@/lib/utils/auth";

export async function registerInvitedUser(token: string, plainPassword: string): Promise<void> {
  // 1) Fetch the invite record
  const invite = await getInviteToken(token);
  if (!invite) {
    throw new Error("Invalid or already used invitation.");
  }

  // 2) Check expiry
  const expires = new Date(invite.expires_at);
  if (Date.now() > expires.getTime()) {
    throw new Error("Invitation link has expired.");
  }

  // 3) Hash password
  const hashedPw = await hashPassword(plainPassword);

  // 4) Create user in Hasura
  await registerInvitedPracticeUser({
    email: invite.email,
    password: hashedPw,
    role: "verified-practice",
    practiceId: invite.practice_id,
  });

  // 5) Mark invite as used
  await markInviteAsUsed(token);
}


export async function registerInvitedPracticeUser({
  email,
  password,
  role,
  practiceId,
}: {
  email: string;
  password: string;
  role: string;
  practiceId: string;
}): Promise<{ user_id: string; email: string }> {
  // Hash the password.

  // Call the Hasura mutation to insert the new user.
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: REGISTER_PRACTICE_USER_MUTATION,
      variables: { email, password, role, practiceId },
    }),
  });
  const result = await response.json();

  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || 'Registration failed.');
  }

  return result.data.insert_users_one;
}

const REGISTER_PRACTICE_USER_MUTATION = `
  mutation RegisterUser(
    $email: String!,
    $password: String!,
    $role: String!,
    $practiceId: uuid!
  ) {
    insert_users_one(
      object: {
        email: $email,
        password: $password,
        role: $role,
        practice_id: $practiceId
      }
    ) {
      user_id
      email
    }
  }
`;