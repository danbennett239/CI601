"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./InvitedPage.module.css";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  repeatPassword: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
  message: "Passwords do not match",
  path: ["repeatPassword"],
});

export default function InvitedUserSignupPage() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Check if there's no token in the URL
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invite token.");
    }
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!token) {
      setError("Invite token is required.");
      return;
    }

    // 1) Validate in the client with Zod
    const result = passwordSchema.safeParse({ password, repeatPassword });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    // 2) Call our finalize route
    try {
      const res = await fetch("/api/practice/additional-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Registration failed.");
        return;
      }

      setSuccess(true);
      setError(null);
      setPassword("");
      setRepeatPassword("");
    } catch (err) {
      console.error("Error finalizing invite:", err);
      setError("An unexpected error occurred.");
    }
  }

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Complete Your Invitation</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="password" className={styles.label}>
          Password:
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!token}
        />

        <label htmlFor="repeatPassword" className={styles.label}>
          Confirm Password:
        </label>
        <input
          id="repeatPassword"
          type="password"
          className={styles.input}
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          disabled={!token}
        />

        {error && <p className={styles.error}>{error}</p>}
        {success && <p style={{ color: "green" }}>User registered successfully! You can now log in.</p>}

        <button type="submit" className={styles.button} disabled={!token}>
          Register
        </button>
      </form>
    </div>
  );
}
