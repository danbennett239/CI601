"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./InvitedPage.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { invitedPasswordSchema } from "@/schemas/inviteSchemas";

export default function InvitedUserSignupPage() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [repeatPasswordError, setRepeatPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setFormError("Invalid or missing invite token.");
    }
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setPasswordError(null);
    setRepeatPasswordError(null);
    setFormError(null);

    const result = invitedPasswordSchema.safeParse({ password, repeatPassword });

    if (!result.success) {
      const errorMap = result.error.format();

      setPasswordError(errorMap.password?._errors[0] || null);
      setRepeatPasswordError(errorMap.repeatPassword?._errors[0] || null);
      return;
    }

    if (!token) {
      setFormError("Invite token is required.");
      return;
    }

    try {
      const res = await fetch("/api/practice/additional-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? "Registration failed.");
        return;
      }

      setSuccess(true);
      setPassword("");
      setRepeatPassword("");
    } catch (err) {
      console.error("Error finalizing invite:", err);
      setFormError("An unexpected error occurred.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Complete Your Registration</h2>

        {!success ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="password" className={styles.label}>
              Password:
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={styles.inputWithIcon}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!token}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeIcon}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {passwordError && <p className={styles.error}>{passwordError}</p>}

            <label htmlFor="repeatPassword" className={styles.label}>
              Confirm Password:
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="repeatPassword"
                type={showRepeatPassword ? "text" : "password"}
                className={styles.inputWithIcon}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                disabled={!token}
              />
              <span
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className={styles.eyeIcon}
              >
                {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {repeatPasswordError && (
              <p className={styles.error}>{repeatPasswordError}</p>
            )}

            {formError && <p className={styles.error}>{formError}</p>}

            <button type="submit" className={styles.button} disabled={!token}>
              Register
            </button>
          </form>
        ) : (
          <div className={styles.successMessage}>
            <p className={styles.successText}>
              Your account has been successfully created!
              <br />
              You may now sign in using your new credentials.
            </p>
            <button
              className={styles.button}
              onClick={() => router.push("/signin")}
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
