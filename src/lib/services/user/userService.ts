const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

import { validateInvite } from "./inviteService";
import { markInviteAsUsed } from "./tokenService";
import { UserPayload, signAccessToken, signRefreshToken, hashPassword } from "@/lib/utils/auth";

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

export async function registerInvitedUser(token: string, plainPassword: string): Promise<void> {
  const invite = await validateInvite(token);

  const hashedPw = await hashPassword(plainPassword);

  await registerInvitedPracticeUser({
    email: invite.email,
    password: hashedPw,
    role: "verified-practice",
    practiceId: invite.practice_id,
  });

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

  const mutation = `
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

  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { email, password, role, practiceId },
    }),
  });
  const result = await response.json();

  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || 'Registration failed.');
  }

  return result.data.insert_users_one;
}

export async function checkUserExists(email: string): Promise<boolean> {
  const query = `
    query CheckUserExists($email: String!) {
      users(where: { email: { _eq: $email } }) {
        user_id
      }
    }
  `;

  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables: { email } }),
  });

  const result = await response.json();

  if (!response.ok || result.errors) {
    console.error("Error checking user existence:", result.errors);
    throw new Error("Error checking if user exists.");
  }

  return result.data.users.length > 0; // Returns `true` if user exists
}

export async function updateUserEmail(userId: string, email: string, currentUser: UserPayload) {
  const mutation = `
    mutation UpdateUserEmail($userId: uuid!, $email: String!) {
      update_users_by_pk(
        pk_columns: { user_id: $userId }
        _set: { email: $email }
      ) {
        user_id
        email
        role
        practice_id
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
      body: JSON.stringify({
        query: mutation,
        variables: { userId, email },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Error updating user email");
    }

    const updatedUser = result.data.update_users_by_pk;
    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Prepare response with updated user data
    const responseData: {
      user: { user_id: string; email: string; role: string; practice_id?: string };
      accessToken?: string;
      refreshToken?: string;
    } = { user: updatedUser };

    // If email changed, reissue tokens
    if (email !== currentUser.email) {
      const payload: UserPayload = {
        id: updatedUser.user_id,
        email: updatedUser.email,
        role: updatedUser.role,
        practice_id: updatedUser.practice_id,
        hasura_claims: currentUser.hasura_claims,
        rememberMe: currentUser.rememberMe,
      };
      responseData.accessToken = signAccessToken(payload);
      responseData.refreshToken = signRefreshToken(payload);
    }

    return responseData;
  } catch (error: unknown) {
    console.error("Error in updateUserEmail:", error);
    const message = error instanceof Error ? error.message : "Error updating user email";
    throw new Error(message);
  }
}