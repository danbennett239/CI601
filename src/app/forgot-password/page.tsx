"use client";

import React, { useState } from "react";
import styles from "./ForgotPasswordPage.module.css";
import { forgotPasswordSchema } from "@/schemas/authSchemas";
import { FormErrors } from "@/types/zodTypes";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const router = useRouter();

  const validateEmailOnBlur = () => {
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
    } else {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const trimmedEmail = email.trim();
    const result = forgotPasswordSchema.safeParse({ email: trimmedEmail });
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send reset link");
        setIsSubmitting(false);
        return;
      }

      // Hide form and show success message
      setIsSent(true);
      toast.success("Reset link sent (if account exists).");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Forgot Password</h2>

      {!isSent ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>
            Enter your email address:
          </label>
          <input
            type="text"
            id="email"
            placeholder="Please enter your email address..."
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmailOnBlur} // Validate only when input loses focus
          />
          {errors.email && (
            <span className={styles.error} aria-live="polite">
              {errors.email[0]}
            </span>
          )}
          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Request Reset"}
          </button>
          <div className={styles.backToSignIn}>
            <Link href="/signin">Back to Sign In</Link>
          </div>
        </form>
      ) : (
        <div className={styles.successMessage}>
          <Image src="/emailSent.gif" alt="Email Sent" width={100} height={100} />
          <p className={styles.message}>
            If an account is linked to this email, a password reset link has been sent.
            <br />
            <br />
            Please check your inbox and spam folder.
          </p>
          <button onClick={() => router.push("/signin")} className={styles.button}>
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
}
