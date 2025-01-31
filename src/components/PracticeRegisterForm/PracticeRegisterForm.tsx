"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import styles from "./PracticeRegisterForm.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PracticeRegisterFormProps {
  onSuccess?: () => void;
}

export default function PracticeRegisterForm({ onSuccess }: PracticeRegisterFormProps) {
  // Photo Upload
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Basic Fields
  const [practiceName, setPracticeName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Password Fields (with show/hide)
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Address
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressLine3, setAddressLine3] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  // Opening Hours
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [openingHours, setOpeningHours] = useState(
    daysOfWeek.map(() => ({ open: "", close: "" }))
  );

  // Error handling
  const [error, setError] = useState("");

  /** Handle photo circle click */
  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /** Handle photo file selection */
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);

      // Generate a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /** Handle opening hours changes */
  const handleHoursChange = (index: number, field: "open" | "close", value: string) => {
    const updatedHours = [...openingHours];
    updatedHours[index][field] = value;
    setOpeningHours(updatedHours);
  };

  /** Handle form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (password !== repeatPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");

    // Construct the practice data (adapt as needed for your API)
    const formData = {
      practiceName,
      email,
      password,
      phoneNumber,
      photo,
      address: {
        line1: addressLine1,
        line2: addressLine2,
        line3: addressLine3,
        city,
        postcode,
      },
      openingHours,
    };

    console.log("Practice Register Form Data:", formData);

    try {
      // Example: call your API route
      // const res = await fetch("/api/practice-register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.error || "Registration failed");

      // If success:
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error("Error during registration:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Register Your Practice</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Two-column layout for main fields */}
        <div className={styles.twoColumnGrid}>
          {/* Photo Upload */}
          <div className={styles.fieldBlock}>
            <label className={styles.label}>Practice Photo:</label>
            <div className={styles.photoSection}>
              <div className={styles.photoCircle} onClick={handlePhotoClick}>
                {photoPreview ? (
                  <img className={styles.photoPreview} src={photoPreview} alt="Practice" />
                ) : (
                  <span className={styles.photoIcon}>📷</span>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                style={{ display: "none" }}
                accept="image/*"
              />
            </div>
          </div>

          {/* Practice Name */}
          <div className={styles.fieldBlock}>
            <label htmlFor="practiceName" className={styles.label}>
              Practice Name:
            </label>
            <input
              type="text"
              id="practiceName"
              value={practiceName}
              onChange={(e) => setPracticeName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.fieldBlock}>
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
          </div>

          {/* Password */}
          <div className={styles.fieldBlock}>
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
          </div>

          {/* Phone Number */}
          <div className={styles.fieldBlock}>
            <label htmlFor="phoneNumber" className={styles.label}>
              Phone Number:
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={styles.input}
            />
          </div>

          {/* Confirm Password */}
          <div className={styles.fieldBlock}>
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
                required
              />
              <span
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className={styles.eyeIcon}
              >
                {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
        </div>
        {/* END twoColumnGrid for main fields */}

        {/* Address Fields (another two-column grid) */}
        <div className={styles.twoColumnGrid}>
          <div className={styles.fieldBlock}>
            <label htmlFor="addressLine1" className={styles.label}>
              Address Line 1:
            </label>
            <input
              type="text"
              id="addressLine1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldBlock}>
            <label htmlFor="addressLine2" className={styles.label}>
              Address Line 2:
            </label>
            <input
              type="text"
              id="addressLine2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldBlock}>
            <label htmlFor="addressLine3" className={styles.label}>
              Address Line 3:
            </label>
            <input
              type="text"
              id="addressLine3"
              value={addressLine3}
              onChange={(e) => setAddressLine3(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldBlock}>
            <label htmlFor="city" className={styles.label}>
              City/Town:
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldBlock}>
            <label htmlFor="postcode" className={styles.label}>
              Postcode:
            </label>
            <input
              type="text"
              id="postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>
        {/* END Address Fields */}

        {/* Opening Hours */}
        <div className={styles.hoursSection}>
          <h3 className={styles.hoursTitle}>Opening Hours</h3>
          {daysOfWeek.map((day, index) => (
            <div key={day} className={styles.dayRow}>
              <div className={styles.dayLabel}>{day}:</div>
              <input
                type="time"
                value={openingHours[index].open}
                onChange={(e) => handleHoursChange(index, "open", e.target.value)}
                className={styles.inputTime}
              />
              <span>-</span>
              <input
                type="time"
                value={openingHours[index].close}
                onChange={(e) => handleHoursChange(index, "close", e.target.value)}
                className={styles.inputTime}
              />
            </div>
          ))}
        </div>
        {/* END Opening Hours */}

        {/* Error Message */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Submit Button */}
        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
    </div>
  );
}
