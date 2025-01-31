"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import styles from "./PracticeRegisterForm.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/** Utility to parse "HH:MM" -> total minutes from midnight */
function timeToMinutes(t: string): number {
  const [hh, mm] = t.split(":");
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}
/** Quick check for valid "HH:MM" format */
function isValidTime(t: string): boolean {
  return /^\d{2}:\d{2}$/.test(t);
}

interface PracticeRegisterFormProps {
  onSuccess?: () => void;
}

interface DayHours {
  dayName: string;
  open: string;
  close: string;
  closed: boolean;
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
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");

  // Opening Hours
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [openingHours, setOpeningHours] = useState<DayHours[]>(
    daysOfWeek.map((day) => ({
      dayName: day,
      open: "",
      close: "",
      closed: false,
    }))
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

  /** Validate times so that close >= open (if both are set). */
  const validateTimes = (updatedIndex: number, field: "open" | "close") => {
    const dayObj = openingHours[updatedIndex];
    if (!dayObj.closed) {
      const openVal = dayObj.open;
      const closeVal = dayObj.close;

      if (isValidTime(openVal) && isValidTime(closeVal)) {
        if (timeToMinutes(closeVal) <= timeToMinutes(openVal)) {
          // If invalid, clear the one we just changed or show an error
          if (field === "close") {
            alert("Closing time must be after opening time.");
            setOpeningHours((prev) => {
              const cloned = [...prev];
              cloned[updatedIndex].close = "";
              return cloned;
            });
          } else {
            alert("Opening time must be before closing time.");
            setOpeningHours((prev) => {
              const cloned = [...prev];
              cloned[updatedIndex].open = "";
              return cloned;
            });
          }
        }
      }
    }
  };

  /** Handle opening hours changes for time inputs */
  const handleHoursChange = (index: number, field: "open" | "close", value: string) => {
    setOpeningHours((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
    // After setting, re-validate
    setTimeout(() => validateTimes(index, field), 0);
  };

  /** Handle the 'Closed' checkbox toggle */
  const handleClosedChange = (index: number, checked: boolean) => {
    setOpeningHours((prev) => {
      const updated = [...prev];
      if (checked) {
        // If user just checked "Closed", clear the open/close times
        updated[index].open = "";
        updated[index].close = "";
        updated[index].closed = true;
      } else {
        // If user unchecked, set to false => day is open
        updated[index].closed = false;
      }
      return updated;
    });
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

    // Transform openingHours to place "closed" if day is closed
    const finalHours = openingHours.map((dayObj) => {
      if (dayObj.closed) {
        return {
          dayName: dayObj.dayName,
          open: "closed",
          close: "closed",
        };
      } else {
        return {
          dayName: dayObj.dayName,
          open: dayObj.open,
          close: dayObj.close,
        };
      }
    });

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
        county,
        postcode,
        country,
      },
      openingHours: finalHours,
    };

    console.log("Practice Register Form Data:", formData);

    try {
      const res = await fetch("/api/practice/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      console.log("Practice registered:", data);

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
              <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
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
            <label htmlFor="county" className={styles.label}>
              County:
            </label>
            <input
              type="text"
              id="county"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
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
          <div className={styles.fieldBlock}>
            <label htmlFor="country" className={styles.label}>
              Country:
            </label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>
        {/* END Address Fields */}

        {/* Opening Hours */}
        <div className={styles.hoursSection}>
          <h3 className={styles.hoursTitle}>Opening Hours</h3>
          {openingHours.map((dayObj, index) => (
            <div key={dayObj.dayName} className={styles.dayRow}>
              <div className={styles.dayLabel}>{dayObj.dayName}:</div>

              <input
                type="time"
                value={dayObj.open}
                onChange={(e) => handleHoursChange(index, "open", e.target.value)}
                className={styles.inputTime}
                disabled={dayObj.closed}
              />
              <span>-</span>
              <input
                type="time"
                value={dayObj.close}
                onChange={(e) => handleHoursChange(index, "close", e.target.value)}
                className={styles.inputTime}
                disabled={dayObj.closed}
              />

              <label className={styles.closedCheckbox}>
                <input
                  type="checkbox"
                  checked={dayObj.closed}
                  onChange={(e) => handleClosedChange(index, e.target.checked)}
                />
                Closed
              </label>

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
