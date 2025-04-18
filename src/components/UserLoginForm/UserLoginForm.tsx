// components/UserLoginForm.tsx
"use client";

import React, { useState } from "react";
import styles from "./UserLoginForm.module.css";
import { userLoginSchema } from "../../schemas/authSchemas";
import { toast } from "react-toastify";
import Link from "next/link";

interface UserLoginFormProps {
  onSuccess?: () => void;
}

type FormErrors = { [key: string]: string[] };

const UserLoginForm: React.FC<UserLoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // New state for Remember Me
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const result = userLoginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }), // Include rememberMe
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: [data.error || "Login failed."] });
        return;
      }

      toast.success("Login successful");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setErrors({ form: ["Login error. Please try again."] });
    }
  };

  return (
    <div className={styles.formWrapper} data-cy="login-form">
      <h2 className={styles.title}>Sign In</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="email" className={styles.label}>
          Email:
        </label>
        <input
          type="text"
          id="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email &&
          errors.email.map((msg, i) => (
            <span key={i} className={styles.error}>
              {msg}
            </span>
          ))}

        <label htmlFor="password" className={styles.label}>
          Password:
        </label>
        <input
          type="password"
          id="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password &&
          errors.password.map((msg, i) => (
            <span key={i} className={styles.error}>
              {msg}
            </span>
          ))}

        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={styles.checkbox}
          />
          <label htmlFor="rememberMe" className={styles.checkboxLabel}>
            Remember Me
          </label>
        </div>

        {errors.form && (
          <div className={styles.formError}>
            {errors.form.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        )}
        <button type="submit" className={styles.button}>
          Sign In
        </button>
        <div className={styles.forgotPassword}>
          <Link href="/forgot-password">Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
};

export default UserLoginForm;