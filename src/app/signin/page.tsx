"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../../styles/SignIn.module.css";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Login error:", data.error);
        return;
      }

      console.log("Login successful:");
    } catch (err: any) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className={styles.outerWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Sign In</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <label htmlFor="password" className={styles.label}>
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>
        <div className={styles.register}>
          <p>Don’t have an account?</p>
          <Link href="/register">
            <button className={styles.registerButton}>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
