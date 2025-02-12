// lib/services/authService.ts
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '@/lib/utils/auth';

const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET!;

const GET_USER_BY_EMAIL = `
  query GetUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      user_id
      email
      password
      role
      practice_id
    }
  }
`;

const REGISTER_USER_MUTATION = `
  mutation RegisterUser(
    $first_name: String!,
    $last_name: String!,
    $email: String!,
    $password: String!,
    $role: String!
  ) {
    insert_users_one(
      object: {
        first_name: $first_name,
        last_name: $last_name,
        email: $email,
        password: $password,
        role: $role
      }
    ) {
      user_id
      email
    }
  }
`;

/**
 * Log in a user by verifying credentials and signing tokens.
 */
export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ user_id: string; email: string; role: string; accessToken: string; refreshToken: string }> {
  // Fetch user by email from Hasura.
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query: GET_USER_BY_EMAIL, variables: { email } }),
  });
  const result = await response.json();

  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || 'Login failed.');
  }

  const user = result.data.users[0];
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // Compare the provided password with the stored (hashed) password.
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password.');
  }

  // Build payload for token signing.
  const payload = {
    id: user.user_id,
    email: user.email,
    role: user.role,
    practice_id: user.practice_id,
    hasura_claims: {
      'x-hasura-default-role': user.role,
      'x-hasura-allowed-roles': [user.role],
      'x-hasura-user-id': user.user_id,
    },
  };

  // Sign the access and refresh tokens.
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user_id: user.user_id, email: user.email, role: user.role, accessToken, refreshToken };
}

/**
 * Register a new user.
 */
export async function registerUser({
  first_name,
  last_name,
  email,
  password,
  role,
}: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
}): Promise<{ user_id: string; email: string }> {
  // Hash the password.
  const hashedPassword = await bcrypt.hash(password, 10);

  // Call the Hasura mutation to insert the new user.
  const response = await fetch(HASURA_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: REGISTER_USER_MUTATION,
      variables: { first_name, last_name, email, password: hashedPassword, role },
    }),
  });
  const result = await response.json();

  if (!response.ok || result.errors) {
    throw new Error(result.errors?.[0]?.message || 'Registration failed.');
  }

  return result.data.insert_users_one;
}
