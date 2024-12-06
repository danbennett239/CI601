"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../../styles/Register.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Password match validation
    if (password !== repeatPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError(""); // Clear error if passwords match
    console.log("Registering user:", { name, email, password });
    // TODO: Add API call for user registration
  };

  return (
    <div className={styles.outerWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Register</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name Input */}
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

          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Repeat Password Input */}
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

          {/* Error Message */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Submit Button */}
          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>

        {/* Back to Sign In */}
        <div className={styles.register}>
          <p>Already have an account?</p>
          <Link href="/signin">
            <button className={styles.registerButton}>Sign In</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
