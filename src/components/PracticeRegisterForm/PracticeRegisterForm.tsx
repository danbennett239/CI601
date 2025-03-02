"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import styles from "./PracticeRegisterForm.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

function timeToMinutes(t: string): number {
  const [hh, mm] = t.split(":");
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}

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
  price: number | null;
}

interface PracticeRegisterFormProps {
  onSuccess?: () => void;
}

export default function PracticeRegisterForm({ onSuccess }: PracticeRegisterFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [practiceName, setPracticeName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressLine3, setAddressLine3] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [openingHours, setOpeningHours] = useState<DayHours[]>(
    daysOfWeek.map((day) => ({
      dayName: day,
      open: "",
      close: "",
      closed: false,
    }))
  );

  const serviceOptionsList = ["Checkup", "Cleaning", "Whitening", "Filling", "Emergency", "Extraction"];
  const [servicesOffered, setServicesOffered] = useState<ServiceOption[]>(
    serviceOptionsList.map((name) => ({
     	name,
      enabled: false,
      price: null,
    }))
  );

  const [error, setError] = useState("");

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  const handleHoursChange = (index: number, field: "open" | "close", value: string) => {
    setOpeningHours((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
    setTimeout(() => validateTimes(index, field), 0);
  };

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

  const handleServiceToggle = (index: number, checked: boolean) => {
    setServicesOffered((prev) => {
      const updated = [...prev];
      updated[index].enabled = checked;
      if (!checked) {
        updated[index].price = null;
      }
      return updated;
    });
  };

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
    <>
      <Link href="/signin" className={styles.backLink}>Back to Sign In</Link>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Register Your Practice</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.photoSection}>
            <div className={styles.photoCircle} onClick={handlePhotoClick}>
              {photoPreview ? (
                <img src={photoPreview} alt="Practice" className={styles.photoPreview} />
              ) : (
                <span className={styles.photoPlaceholder}>Add Photo</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              style={{ display: "none" }}
              accept="image/*"
            />
            <label className={styles.photoLabel}>Practice Photo</label>
          </div>

          <div className={styles.grid}>
            <div>
              <input
                type="text"
                value={practiceName}
                onChange={(e) => setPracticeName(e.target.value)}
                className={styles.input}
                placeholder="Practice Name"
                required
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="Email"
                required
              />
            </div>
            <div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={styles.input}
                placeholder="Phone Number"
              />
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Password"
                required
              />
              <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showRepeatPassword ? "text" : "password"}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className={styles.input}
                placeholder="Confirm Password"
                required
              />
              <span onClick={() => setShowRepeatPassword(!showRepeatPassword)} className={styles.eyeIcon}>
                {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Address</h3>
            <p className={styles.sectionDescription}>Provide your practice’s location details for patients to find you.</p>
            <div className={styles.grid}>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className={styles.input}
                placeholder="Address Line 1"
              />
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className={styles.input}
                placeholder="Address Line 2"
              />
              <input
                type="text"
                value={addressLine3}
                onChange={(e) => setAddressLine3(e.target.value)}
                className={styles.input}
                placeholder="Address Line 3"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={styles.input}
                placeholder="City/Town"
              />
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className={styles.input}
                placeholder="County"
              />
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className={styles.input}
                placeholder="Postcode"
              />
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={styles.input}
                placeholder="Country"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Opening Hours</h3>
            <p className={styles.sectionDescription}>Set your practice’s operating hours for each day of the week.</p>
            {openingHours.map((dayObj, index) => (
              <div key={dayObj.dayName} className={styles.hoursRow}>
                <span className={styles.dayLabel}>{dayObj.dayName}</span>
                <div className={styles.timeGroup}>
                  <input
                    type="time"
                    value={dayObj.open}
                    onChange={(e) => handleHoursChange(index, "open", e.target.value)}
                    className={styles.timeInput}
                    disabled={dayObj.closed}
                  />
                  <span className={styles.timeSeparator}>—</span>
                  <input
                    type="time"
                    value={dayObj.close}
                    onChange={(e) => handleHoursChange(index, "close", e.target.value)}
                    className={styles.timeInput}
                    disabled={dayObj.closed}
                  />
                </div>
                <label className={styles.checkboxLabel}>
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

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Services Offered</h3>
            <p className={styles.sectionDescription}>Select the dental services your practice provides and their prices in GBP.</p>
            {servicesOffered.map((service, index) => (
              <div key={service.name} className={styles.serviceRow}>
                <label className={styles.checkboxLabel}>
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
          <p className={styles.infoText}>
            A member of our admin team will review your application. You’ll receive an email once verification is complete.
          </p>

          <p className={styles.infoText}>
            All information provided can be updated in your Practice Dashboard under Practice Preferences after verification is complete.
          </p>

          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton}>
            Register Practice
          </button>
        </form>
      </div>
    </>
  );
}