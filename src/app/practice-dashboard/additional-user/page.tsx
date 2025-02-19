"use client";

import React, { useState, FormEvent } from "react";
import styles from "./AdditionalUserPage.module.css";
import { useUser } from "@/hooks/useUser";
import { z } from "zod";

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// interface User {
//   practice_id: string;
// }

export default function AdditionalUserPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

    const { user } = useUser();
  const practiceId = user?.practice_id;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // 1) Validate on client with Zod
    const result = inviteFormSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    // 2) Make sure we have a valid practiceId
    if (!practiceId) {
      setError("No practice ID found; please log in again.");
      return;
    }

    // 3) Send to our API route
    try {
      const res = await fetch("/api/practice/additional-user/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, practiceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to send invitation.");
        return;
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error("Error sending invite:", err);
      setError("An unexpected error occurred.");
    }
  }

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Add an Additional Practice User</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="email" className={styles.label}>
          Email:
        </label>
        <input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />

        {error && <p className={styles.error}>{error}</p>}
        {success && <p style={{ color: "green" }}>Invitation sent!</p>}

        <button type="submit" className={styles.button}>
          Send Invitation
        </button>
      </form>
    </div>
  );
}
