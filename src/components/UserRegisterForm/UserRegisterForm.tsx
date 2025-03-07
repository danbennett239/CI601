"use client";

import React, { useState } from "react";
import styles from "./UserRegisterForm.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { userRegistrationSchema } from "../../schemas/authSchemas";
import { toast } from "react-toastify";

type FormErrors = { [key: string]: string[] };

interface UserRegisterFormProps {
  onSuccess?: () => void;
}

const UserRegisterForm: React.FC<UserRegisterFormProps> = ({ onSuccess }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      repeatPassword,
      role: "user",
    };

    const result = userRegistrationSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role: "user",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: [data.error || "Registration failed."] });
        return;
      }

      toast.success("User registered successfully");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Error during registration:", err);
      setErrors({ form: ["Registration failed. Please try again."] });
    }
  };

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="firstName" className={styles.label}>
          First Name:
        </label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={styles.input}
        />
        {errors.first_name &&
          errors.first_name.map((msg, i) => (
            <span key={i} className={styles.error}>
              {msg}
            </span>
          ))}

        <label htmlFor="lastName" className={styles.label}>
          Last Name:
        </label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={styles.input}
        />
        {errors.last_name &&
          errors.last_name.map((msg, i) => (
            <span key={i} className={styles.error}>
              {msg}
            </span>
          ))}

        <label htmlFor="email" className={styles.label}>
          Email:
        </label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
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
        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputWithIcon}
          />
          <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password &&
          errors.password.map((msg, i) => (
            <span key={i} className={styles.error}>
              {msg}
            </span>
          ))}

        <label htmlFor="repeatPassword" className={styles.label}>
          Confirm Password:
        </label>
        <div className={styles.inputWrapper}>
          <input
            type={showRepeatPassword ? "text" : "password"}
            id="repeatPassword"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className={styles.inputWithIcon}
          />
          <span
            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            className={styles.eyeIcon}
          >
            {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.repeatPassword &&
          errors.repeatPassword.map((msg, i) => (
            <span key={i} className={styles.error}>
              {msg}
            </span>
          ))}

        {errors.form && (
          <div className={styles.formError}>
            {errors.form.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        )}

        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
    </div>
  );
};

export default UserRegisterForm;