const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL ?? "";
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET ?? "";

// The shape of an invite record in our DB
export interface PracticeInviteRecord {
  id: string;
  email: string;
  token: string;
  practice_id: string;
  expires_at: string; // ISO string from DB
  used: boolean;
}

/**
 * Insert an invite token into Hasura.
 */
export async function insertInviteToken(
  email: string,
  token: string,
  practiceId: string,
  expiresAt: Date
): Promise<void> {
  const mutation = `
    mutation InsertInviteToken(
      $email: String!,
      $token: String!,
      $practice_id: uuid!,
      $expires_at: timestamptz!
    ) {
      insert_practice_invites_one(object: {
        email: $email
        token: $token
        practice_id: $practice_id
        expires_at: $expires_at
        used: false
      }) {
        id
      }
    }
  `;

  const variables = {
    email,
    token,
    practice_id: practiceId,
    expires_at: expiresAt.toISOString(),
  };

  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  const result = await response.json();

  if (!response.ok || result.errors) {
    const msg = result.errors?.[0]?.message ?? "Error inserting invite token";
    throw new Error(msg);
  }
}

/**
 * Retrieve an unused invite token from Hasura.
 */
export async function getInviteToken(token: string): Promise<PracticeInviteRecord | null> {
  const query = `
    query GetInviteToken($token: String!) {
      practice_invites(
        where: { token: { _eq: $token }, used: { _eq: false } },
        limit: 1
      ) {
        id
        email
        token
        practice_id
        expires_at
        used
      }
    }
  `;

  const variables = { token };

  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (!response.ok || result.errors) {
    const msg = result.errors?.[0]?.message ?? "Error retrieving invite token";
    throw new Error(msg);
  }

  const invites: PracticeInviteRecord[] = result.data?.practice_invites ?? [];
  if (invites.length === 0) {
    return null;
  }
  return invites[0];
}

/**
 * Mark an invite as used in Hasura.
 */
export async function markInviteAsUsed(token: string): Promise<void> {
  const mutation = `
    mutation MarkInviteAsUsed($token: String!) {
      update_practice_invites(
        where: { token: { _eq: $token } },
        _set: { used: true }
      ) {
        affected_rows
      }
    }
  `;
  const variables = { token };

  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  const result = await response.json();
  if (!response.ok || result.errors) {
    const msg = result.errors?.[0]?.message ?? "Error marking invite as used";
    throw new Error(msg);
  }
}
