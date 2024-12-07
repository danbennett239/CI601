import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

const REGISTER_USER_MUTATION = `
  mutation RegisterUser($name: String!, $email: String!, $password: String!, $role: String!) {
    insert_users_one(object: { name: $name, email: $email, password: $password, role: $role }) {
      user_id
      email
    }
  }
`;

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: REGISTER_USER_MUTATION,
        variables: { name, email, password: hashedPassword, role },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      return NextResponse.json({ error: result.errors?.[0]?.message || "Registration failed." }, { status: 400 });
    }

    return NextResponse.json({ user_id: result.data.insert_users_one.user_id, email: result.data.insert_users_one.email });
  } catch {
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
