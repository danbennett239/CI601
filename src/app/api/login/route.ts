import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

const GET_USER_BY_EMAIL = `
  query GetUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      user_id
      email
      password
      role
    }
  }
`;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const response = await fetch(HASURA_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: GET_USER_BY_EMAIL,
        variables: { email },
      }),
    });

    const result = await response.json();

    if (!response.ok || result.errors) {
      return NextResponse.json({ error: result.errors?.[0]?.message || "Login failed." }, { status: 400 });
    }

    const user = result.data.users[0];
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Generate JWT server-side
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.role,
        hasura_claims: {
          "x-hasura-default-role": user.role,
          "x-hasura-allowed-roles": [user.role],
          "x-hasura-user-id": user.user_id,
        },
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ token, user_id: user.user_id, email: user.email });
  } catch (err: any) {
    return NextResponse.json({ error: "Authentication failed." }, { status: 500 });
  }
}
