const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

const CREATE_PRACTICE_MUTATION = `
  mutation CreatePractice(
    $practice_name: String!,
    $email: String!,
    $phone_number: String,
    $photo: String,
    $address: jsonb,
    $opening_hours: jsonb
  ) {
    insert_practices_one(
      object: {
        practice_name: $practice_name,
        email: $email,
        phone_number: $phone_number,
        photo: $photo,
        address: $address,
        opening_hours: $opening_hours,
        verified: false
      }
    ) {
      practice_id
    }
  }
`;

export async function createPractice({
  practice_name,
  email,
  phone_number,
  photo,
  address,
  opening_hours,
}: {
  practice_name: string;
  email: string;
  phone_number?: string;
  photo?: string;
  address: Record<string, string>;
  opening_hours: Array<{ dayName: string; open: string; close: string }>;
}) {
  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: CREATE_PRACTICE_MUTATION,
        variables: {
          practice_name,
          email,
          phone_number,
          photo,
          address,
          opening_hours,
        },
      }),
    });

    const result = await response.json();

    // ✅ Handle errors properly
    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Practice registration failed.");
    }

    // ✅ Return practice data
    return {
      practice_id: result.data.insert_practices_one.practice_id,
      email: result.data.insert_practices_one.email,
    };
  } catch (error) {
    console.error("Practice Registration Error:", error);
    throw new Error("Practice registration failed. Please try again.");
  }
}
