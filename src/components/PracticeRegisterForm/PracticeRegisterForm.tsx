"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import styles from "./PracticeRegisterForm.module.css";

interface PracticeRegisterFormProps {
  onSuccess?: () => void;
}

export default function PracticeRegisterForm({
  onSuccess,
}: PracticeRegisterFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(""); // For displaying the selected image
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [practiceName, setPracticeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // For addresses, you might want an object with multiple fields
  const [address, setAddress] = useState("");

  // Opening hours for each day (Mon-Sun). If you only want Mon-Fri, adjust accordingly
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [openingHours, setOpeningHours] = useState(
    daysOfWeek.map(() => ({ open: "", close: "" }))
  );

  // Handle changes for each day's open/close times
  const handleHoursChange = (
    index: number,
    field: "open" | "close",
    value: string
  ) => {
    const updatedHours = [...openingHours];
    updatedHours[index][field] = value;
    setOpeningHours(updatedHours);
  };

  // Optional: You might add more fields, e.g. website, services, etc.
  // const [website, setWebsite] = useState("");

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);

      // Generate a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation check
    if (!practiceName || !email || !password || !passwordConfirm) {
      alert("Please fill in all required fields.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("Passwords do not match.");
      return;
    }

    // Construct form data
    const formData = {
      practiceName,
      email,
      password,
      phoneNumber,
      address,
      openingHours,
      // Possibly handle photo with file upload or base64
      photo,
    };

    // Do something with this data, e.g. call your backend API
    // fetch("/api/practice/register", { method: "POST", ... })

    console.log("Practice Register FormData:", formData);

    // If everything is successful:
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.photoSection}>
        <div className={styles.photoCircle} onClick={handlePhotoClick}>
          {preview ? (
            <img className={styles.photoPreview} src={preview} alt="Practice" />
          ) : (
            <div className={styles.photoIcon}>📷</div> // Or use an <svg> icon
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          style={{ display: "none" }}
          accept="image/*"
        />
        <p className={styles.photoText}>Click to upload practice photo</p>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="practiceName">Practice Name</label>
        <input
          id="practiceName"
          type="text"
          value={practiceName}
          onChange={(e) => setPracticeName(e.target.value)}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="passwordConfirm">Confirm Password</label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className={styles.hoursSection}>
        <h3>Opening Hours</h3>
        {daysOfWeek.map((day, index) => (
          <div key={day} className={styles.dayRow}>
            <span>{day}</span>
            <input
              type="time"
              value={openingHours[index].open}
              onChange={(e) => handleHoursChange(index, "open", e.target.value)}
            />
            <span>-</span>
            <input
              type="time"
              value={openingHours[index].close}
              onChange={(e) => handleHoursChange(index, "close", e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Optionally, a field for website, description, etc.
      <div className={styles.inputGroup}>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      */}

      <button type="submit" className={styles.submitButton}>
        Register Practice
      </button>
    </form>
  );
}
