// /app/forgot-password/page.tsx
"use client";

import React, { useState } from "react";
import styles from "./ForgotPasswordPage.module.css";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send reset link");
        return;
      }
      setMessage("If this email is associated with an account, a reset link has been sent.");
      toast.success("Reset link sent (if account exists).");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Forgot Password</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="email" className={styles.label}>
          Enter your email address:
        </label>
        <input
          type="email"
          id="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className={styles.button}>
          Request Reset
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
