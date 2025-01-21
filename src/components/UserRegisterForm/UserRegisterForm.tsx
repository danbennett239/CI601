"use client";

import React, { useState } from "react";
import styles from "./UserRegisterForm.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface UserRegisterFormProps {
  onSuccess?: () => void; // callback if registration is successful
}

const UserRegisterForm: React.FC<UserRegisterFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password match validation
    if (password !== repeatPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "user" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      console.log("User registered successfully:", data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Error during registration:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="name" className={styles.label}>
          Name:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          required
        />

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
        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputWithIcon}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className={styles.eyeIcon}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <label htmlFor="repeatPassword" className={styles.label}>
          Repeat Password:
        </label>
        <div className={styles.inputWrapper}>
          <input
            type={showRepeatPassword ? "text" : "password"}
            id="repeatPassword"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className={styles.inputWithIcon}
            required
          />
          <span
            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            className={styles.eyeIcon}
          >
            {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
    </div>
  );
};

export default UserRegisterForm;
