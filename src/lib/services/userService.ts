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
