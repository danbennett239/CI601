const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

export interface PracticeInviteRecord {
  invite_id: string;
  email: string;
  token: string;
  practice_id: string;
  expires_at: string;
  created_at: string;
  used: boolean;
  used_at: string | null;
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
      $expires_at: timestamp!
    ) {
      insert_practice_invites_one(object: {
        email: $email
        token: $token
        practice_id: $practice_id
        expires_at: $expires_at
        used: false
        used_at: null
      }) {
        invite_id
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
        invite_id
        email
        token
        practice_id
        expires_at
        created_at
        used
        used_at
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
    mutation MarkInviteAsUsed($token: String!, $usedAt: timestamp!) {
      update_practice_invites(
        where: { token: { _eq: $token } },
        _set: { used: true, used_at: $usedAt }
      ) {
        affected_rows
      }
    }
  `;
  const variables = {
    token,
    usedAt: new Date().toISOString(),
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
    const msg = result.errors?.[0]?.message ?? "Error marking invite as used";
    throw new Error(msg);
  }
}
