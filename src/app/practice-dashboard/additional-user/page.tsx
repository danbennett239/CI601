"use client";

import React, { useState, FormEvent } from "react";
import styles from "./AdditionalUserPage.module.css";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { inviteFormSchema } from "@/schemas/inviteSchemas";

export default function AdditionalUserPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [gifSrc, setGifSrc] = useState("/emailSent.gif");

  const { user } = useUser();
  const practiceId = user?.practice_id;
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSent(false);

    const result = inviteFormSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    if (!practiceId) {
      setError("No practice ID found; please log in again.");
      return;
    }

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

      setGifSrc(`/emailSent.gif?nocache=${Date.now()}`);
      
      setIsSent(true);
      setEmail("");
    } catch (err) {
      console.error("Error sending invite:", err);
      setError("An unexpected error occurred.");
    }
  }

  function handleAddAnother() {
    setEmail("");
    setError(null);
    setIsSent(false);
    setGifSrc("");
  }

  return (
    <div className={styles.container}>
      <div className={styles.backLink}>
        <Link href="/practice-dashboard">&larr; Back to Dashboard</Link>
      </div>

      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Add an Additional Practice User</h2>

        {isSent ? (
          <div className={styles.successMessage}>
            <Image src={gifSrc} alt="Email Sent" width={120} height={120} />
            <p className={styles.successText}>
              Your invitation has been sent successfully!
              <br />
              The recipient can complete their sign-up via the email instructions.
              <br />
              Please remind them to check their inbox and spam folder.
            </p>
            <div className={styles.successActions}>
              <button
                onClick={() => router.push("/practice-dashboard")}
                className={styles.button}
              >
                Back to Dashboard
              </button>
              <button onClick={handleAddAnother} className={styles.outlineButton}>
                Add Another User
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="email" className={styles.label}>
              Email:
            </label>
            <input
              id="email"
              type="text"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button}>
              Send Invitation
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
