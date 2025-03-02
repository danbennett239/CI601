"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
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

interface DayHours {
  dayName: string;
  open: string;
  close: string;
  closed: boolean;
}

interface AddressFormData {
  line1: string;
  line2: string;
  line3: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

interface ServiceOption {
  name: string;
  enabled: boolean;
  price: number | null; // GBP
}

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

  // Password Fields
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

  // Services Offered
  const serviceOptionsList = ["Checkup", "Cleaning", "Whitening", "Filling", "Emergency", "Extraction"];
  const [servicesOffered, setServicesOffered] = useState<ServiceOption[]>(
    serviceOptionsList.map((name) => ({
      name,
      enabled: false,
      price: null,
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
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /** Validate opening hours times */
  const validateTimes = (updatedIndex: number, field: "open" | "close") => {
    const dayObj = openingHours[updatedIndex];
    if (!dayObj.closed) {
      const openVal = dayObj.open;
      const closeVal = dayObj.close;

      if (isValidTime(openVal) && isValidTime(closeVal)) {
        if (timeToMinutes(closeVal) <= timeToMinutes(openVal)) {
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

  /** Handle opening hours changes */
  const handleHoursChange = (index: number, field: "open" | "close", value: string) => {
    setOpeningHours((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
    setTimeout(() => validateTimes(index, field), 0);
  };

  /** Handle closed checkbox toggle */
  const handleClosedChange = (index: number, checked: boolean) => {
    setOpeningHours((prev) => {
      const updated = [...prev];
      if (checked) {
        updated[index].open = "";
        updated[index].close = "";
        updated[index].closed = true;
      } else {
        updated[index].closed = false;
      }
      return updated;
    });
  };

  /** Handle service checkbox toggle */
  const handleServiceToggle = (index: number, checked: boolean) => {
    setServicesOffered((prev) => {
      const updated = [...prev];
      updated[index].enabled = checked;
      if (!checked) {
        updated[index].price = null; // Clear price when unchecked
      }
      return updated;
    });
  };

  /** Handle service price change */
  const handlePriceChange = (index: number, value: string) => {
    const price = value === "" ? null : parseFloat(value);
    if (price !== null && (isNaN(price) || price < 0)) {
      setError("Price must be a positive number");
      return;
    }
    setServicesOffered((prev) => {
      const updated = [...prev];
      updated[index].price = price;
      return updated;
    });
  };

  /** Handle form submission */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");

    const finalHours = openingHours.map((dayObj) => {
      if (dayObj.closed) {
        return { dayName: dayObj.dayName, open: "closed", close: "closed" };
      }
      return { dayName: dayObj.dayName, open: dayObj.open, close: dayObj.close };
    });

    const address: AddressFormData = {
      line1: addressLine1,
      line2: addressLine2,
      line3: addressLine3,
      city,
      county,
      postcode,
      country,
    };

    // Build services_offered and pricing_matrix
    const servicesOfferedList = servicesOffered
      .filter((service) => service.enabled)
      .map((service) => service.name.toLowerCase());
    const pricingMatrix = servicesOffered.reduce((acc, service) => {
      if (service.enabled && service.price !== null) {
        acc[service.name.toLowerCase()] = service.price;
      }
      return acc;
    }, {} as Record<string, number>);

    let photoUrl = "";
    if (photo) {
      try {
        const formData = new FormData();
        formData.append("file", photo);
        const uploadRes = await fetch("/api/integrations/upload", {
          method: "PUT",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to server");
        }

        const { fileUrl } = await uploadRes.json();
        photoUrl = fileUrl;
      } catch (err) {
        console.error("Error uploading photo:", err);
        setError("Failed to upload photo. Please try again.");
        return;
      }
    }

    try {
      const res = await fetch("/api/practice/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practiceName,
          email,
          password,
          phoneNumber,
          photo: photoUrl,
          address,
          openingHours: finalHours,
          allowedTypes: servicesOfferedList,
          pricingMatrix,
        }),
      });

      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      console.log("Practice registered:", data);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Register Your Practice</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Two-column grid for main fields */}
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

        {/* Address Fields */}
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

        {/* Services Offered */}
        <div className={styles.servicesSection}>
          <h3 className={styles.servicesTitle}>Services Offered</h3>
          {servicesOffered.map((service, index) => (
            <div key={service.name} className={styles.serviceRow}>
              <label className={styles.serviceCheckbox}>
                <input
                  type="checkbox"
                  checked={service.enabled}
                  onChange={(e) => handleServiceToggle(index, e.target.checked)}
                />
                {service.name}
              </label>
              <input
                type="number"
                value={service.price !== null ? service.price : ""}
                onChange={(e) => handlePriceChange(index, e.target.value)}
                className={styles.priceInput}
                placeholder="Price (GBP)"
                disabled={!service.enabled}
                min="0"
                step="0.01"
              />
            </div>
          ))}
        </div>

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