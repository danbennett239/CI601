# Auth Service Documentation

This document provides detailed information about the authentication-related service functions in a Next.js application. These functions allow users to log in by verifying their credentials and retrieving tokens, and to register new accounts in the Hasura backend.

The service relies on the following environment variables:
- `HASURA_GRAPHQL_URL`: The URL pointing to the Hasura GraphQL endpoint.
- `HASURA_ADMIN_SECRET`: The admin secret for authenticating requests to Hasura.

---

## Table of Contents
1. [loginUser](#loginuser)
2. [registerUser](#registeruser)

---

## loginUser

### Description
Logs in a user by verifying their email and password against the stored (hashed) password. If successful, it returns access and refresh tokens, as well as basic user information.

### Parameters
- `email: string` - The email address of the user attempting to log in.
- `password: string` - The plaintext password of the user.
- `rememberMe: boolean` - Indicates if the user wishes to persist their login status (affecting token claims).

### Returns
- `Promise<{ user_id: string; email: string; role: string; accessToken: string; refreshToken: string }` - 
  An object containing the user's ID, email, role, as well as newly signed access and refresh tokens.

### Throws
- `Error` - If the login fails due to invalid credentials or a backend error.

### Example
```typescript
const userData = await loginUser({
  email: "test@example.com",
  password: "mysecretpassword",
  rememberMe: true,
});
```


---

## registerUser

### Description

Registers a new user by inserting their details into the Hasura backend. It hashes the user's password before storage for security.

### Parameters
- `first_name: string` - The user's first name.
- `last_name: string` - The user's last name.
- `email: string` - The user's email address.
- `password: string` - The user's plaintext password.
- `role: string` - The role assigned to the user (e.g., "user", "admin").

### Returns
- `Promise<{ user_id: string; email: string }>` - An object containing the newly created user's ID and email address.

### Throws
- `Error` - If the registration fails due to a backend error or invalid input.

### Example
```typescript
const newUser = await registerUser({
  first_name: "Alice",
  last_name: "Wonderland",
  email: "alice@example.com",
  password: "s3cr3t",
  role: "user",
});
```
