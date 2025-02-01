import { hashPassword } from "@/utils/auth";

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

const CREATE_PRACTICE_AND_USER_MUTATION = `
  mutation CreatePracticeAndUser(
    $practice_name: String!,
    $email: String!,
    $password: String!,
    $phone_number: String,
    $photo: String,
    $address: jsonb,
    $opening_hours: jsonb,
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
        users: {
          data: {
            first_name: "",
            last_name: "",
            email: $email,
            password: $password,
            role: "unverified-practice"
          }
        }
      }
    ) {
      practice_id
      practice_name
      users {
        user_id
        email
      }
    }
  }
`;

export async function createPracticeWithUser({
  practiceName,
  email,
  password,
  phoneNumber,
  photo,
  address,
  openingHours,
}: {
  practiceName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  photo?: string;
  address: Record<string, string>;
  openingHours: Array<{ dayName: string; open: string; close: string }>;
}) {
  try {
    const hashedPassword = await hashPassword(password);

    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: CREATE_PRACTICE_AND_USER_MUTATION,
        variables: {
          practice_name: practiceName,
          email,
          password: hashedPassword,
          phone_number: phoneNumber,
          photo,
          address,
          opening_hours: openingHours,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      throw new Error(result.errors?.[0]?.message || "Practice registration failed.");
    }

    return {
      practice_id: result.data.insert_practices_one.practice_id,
      practice_name: result.data.insert_practices_one.practice_name,
      user: result.data.insert_practices_one.users[0],
    };
  } catch (error) {
    console.error("Practice Registration Error:", error);
    throw new Error("Practice registration failed. Please try again.");
  }
}