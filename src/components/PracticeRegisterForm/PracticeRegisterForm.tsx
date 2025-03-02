"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import styles from "./PracticeRegisterForm.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { practiceRegistrationSchema } from "@/schemas/practiceSchemas";
import { toast } from "react-toastify";

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

interface FormErrors {
  [key: string]: string | undefined;
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

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
      if (hasSubmitted) validateField("photo", file);
    }
  };

  const validateField = (field: string, value: any) => {
    const formData = {
      practiceName,
      email,
      password,
      repeatPassword,
      phoneNumber,
      photo,
      address: { line1: addressLine1, line2: addressLine2, line3: addressLine3, city, county, postcode, country },
      openingHours: openingHours.map((day) => ({
        dayName: day.dayName,
        open: day.open,
        close: day.close,
        closed: day.closed,
      })),
      allowedTypes: servicesOffered.filter((s) => s.enabled).map((s) => s.name.toLowerCase()),
      pricingMatrix: servicesOffered.reduce((acc, s) => {
        if (s.enabled && s.price !== null) acc[s.name.toLowerCase()] = s.price;
        return acc;
      }, {} as Record<string, number>),
    };

    const validationResult = practiceRegistrationSchema.safeParse({ ...formData, [field]: value });
    if (validationResult.success) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    } else {
      const error = validationResult.error.errors.find((err) => err.path.join(".") === field);
      if (error) {
        setFormErrors((prev) => ({ ...prev, [field]: error.message }));
      }
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
            toast.error("Closing time must be after opening time.");
            setOpeningHours((prev) => {
              const cloned = [...prev];
              cloned[updatedIndex].close = "";
              return cloned;
            });
          } else {
            toast.error("Opening time must be before closing time.");
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

  const handleInputChange = (field: string, value: string, setter: (value: string) => void) => {
    setter(value);
    if (hasSubmitted) validateField(field, value);
  };

  const handleHoursChange = (index: number, field: "open" | "close", value: string) => {
    setOpeningHours((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
    setTimeout(() => validateTimes(index, field), 0);
    if (hasSubmitted) {
      const formData = openingHours.map((day, i) => ({
        dayName: day.dayName,
        open: i === index && field === "open" ? value : day.open,
        close: i === index && field === "close" ? value : day.close,
        closed: day.closed,
      }));
      const validationResult = practiceRegistrationSchema.safeParse({
        practiceName,
        email,
        password,
        repeatPassword,
        phoneNumber,
        photo,
        address: { line1: addressLine1, line2: addressLine2, line3: addressLine3, city, county, postcode, country },
        openingHours: formData,
        allowedTypes: servicesOffered.filter((s) => s.enabled).map((s) => s.name.toLowerCase()),
        pricingMatrix: servicesOffered.reduce((acc, s) => {
          if (s.enabled && s.price !== null) acc[s.name.toLowerCase()] = s.price;
          return acc;
        }, {} as Record<string, number>),
      });
      if (validationResult.success) {
        setFormErrors((prev) => ({
          ...prev,
          [`openingHours.${index}.open`]: undefined,
          [`openingHours.${index}.close`]: undefined,
          openingHours: undefined,
        }));
      } else {
        const errors = validationResult.error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {} as FormErrors);
        setFormErrors((prev) => ({
          ...prev,
          ...errors,
          [`openingHours.${index}.open`]: errors[`openingHours.${index}.open`],
          [`openingHours.${index}.close`]: errors[`openingHours.${index}.close`],
        }));
      }
    }
  };

  const handleClosedChange = (index: number, checked: boolean) => {
    setOpeningHours((prev) => {
      const updated = [...prev];
      updated[index].closed = checked;
      if (checked) {
        updated[index].open = "";
        updated[index].close = "";
      }
      return updated;
    });
    if (hasSubmitted) {
      const formData = openingHours.map((day, i) => ({
        dayName: day.dayName,
        open: i === index && checked ? "" : day.open,
        close: i === index && checked ? "" : day.close,
        closed: i === index ? checked : day.closed,
      }));
      const validationResult = practiceRegistrationSchema.safeParse({
        practiceName,
        email,
        password,
        repeatPassword,
        phoneNumber,
        photo,
        address: { line1: addressLine1, line2: addressLine2, line3: addressLine3, city, county, postcode, country },
        openingHours: formData,
        allowedTypes: servicesOffered.filter((s) => s.enabled).map((s) => s.name.toLowerCase()),
        pricingMatrix: servicesOffered.reduce((acc, s) => {
          if (s.enabled && s.price !== null) acc[s.name.toLowerCase()] = s.price;
          return acc;
        }, {} as Record<string, number>),
      });
      if (validationResult.success) {
        setFormErrors((prev) => ({
          ...prev,
          [`openingHours.${index}.open`]: undefined,
          [`openingHours.${index}.close`]: undefined,
          openingHours: undefined,
        }));
      } else {
        const errors = validationResult.error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {} as FormErrors);
        setFormErrors((prev) => ({
          ...prev,
          ...errors,
          [`openingHours.${index}.open`]: errors[`openingHours.${index}.open`],
          [`openingHours.${index}.close`]: errors[`openingHours.${index}.close`],
        }));
      }
    }
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
    if (hasSubmitted) validateForm();
  };

  const handlePriceChange = (index: number, value: string) => {
    const price = value === "" ? null : parseFloat(value);
    let updatedServices: ServiceOption[] = [];
    setServicesOffered((prev) => {
      updatedServices = [...prev];
      updatedServices[index].price = price;
      return updatedServices;
    });

    if (hasSubmitted) {
      const formData = {
        practiceName,
        email,
        password,
        repeatPassword,
        phoneNumber,
        photo,
        address: { line1: addressLine1, line2: addressLine2, line3: addressLine3, city, county, postcode, country },
        openingHours: openingHours.map((day) => ({
          dayName: day.dayName,
          open: day.open,
          close: day.close,
          closed: day.closed,
        })),
        allowedTypes: updatedServices.filter((s) => s.enabled).map((s) => s.name.toLowerCase()),
        pricingMatrix: updatedServices.reduce((acc, s) => {
          if (s.enabled && s.price !== null) acc[s.name.toLowerCase()] = s.price;
          return acc;
        }, {} as Record<string, number>),
      };

      const validationResult = practiceRegistrationSchema.safeParse(formData);
      if (validationResult.success) {
        setFormErrors((prev) => ({
          ...prev,
          allowedTypes: undefined,
          pricingMatrix: undefined,
          [`pricingMatrix.${serviceOptionsList[index].toLowerCase()}`]: undefined,
        }));
      } else {
        const errors = validationResult.error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {} as FormErrors);
        setFormErrors((prev) => ({
          ...prev,
          ...errors,
          allowedTypes: errors.allowedTypes,
          pricingMatrix: errors.pricingMatrix,
          [`pricingMatrix.${serviceOptionsList[index].toLowerCase()}`]:
            errors[`pricingMatrix.${serviceOptionsList[index].toLowerCase()}`],
        }));
      }
    }
  };

  const validateForm = () => {
    const formData = {
      practiceName,
      email,
      password,
      repeatPassword,
      phoneNumber,
      photo,
      address: { line1: addressLine1, line2: addressLine2, line3: addressLine3, city, county, postcode, country },
      openingHours: openingHours.map((day) => ({
        dayName: day.dayName,
        open: day.open,
        close: day.close,
        closed: day.closed,
      })),
      allowedTypes: servicesOffered.filter((s) => s.enabled).map((s) => s.name.toLowerCase()),
      pricingMatrix: servicesOffered.reduce((acc, s) => {
        if (s.enabled && s.price !== null) acc[s.name.toLowerCase()] = s.price;
        return acc;
      }, {} as Record<string, number>),
    };

    const validationResult = practiceRegistrationSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, err) => {
        acc[err.path.join(".")] = err.message;
        return acc;
      }, {} as FormErrors);
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!validateForm()) return;

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
        toast.error("Failed to upload photo. Please try again.");
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
        toast.success("Practice registered successfully!");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      console.log("Practice registered:", data);
      toast.success("Practice registered successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error during registration:", err);
      toast.error("Registration failed. Please try again.");
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
            {formErrors["photo"] && <p className={styles.fieldError}>{formErrors["photo"]}</p>}
          </div>

          <div className={styles.grid}>
            <div>
              <input
                type="text"
                value={practiceName}
                onChange={(e) => handleInputChange("practiceName", e.target.value, setPracticeName)}
                className={styles.input}
                placeholder="Practice Name"
              />
              {formErrors["practiceName"] && <p className={styles.fieldError}>{formErrors["practiceName"]}</p>}
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
                className={styles.input}
                placeholder="Email"
              />
              {formErrors["email"] && <p className={styles.fieldError}>{formErrors["email"]}</p>}
            </div>
            <div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value, setPhoneNumber)}
                className={styles.input}
                placeholder="Phone Number"
              />
              {formErrors["phoneNumber"] && <p className={styles.fieldError}>{formErrors["phoneNumber"]}</p>}
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
                className={styles.input}
                placeholder="Password"
              />
              <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {formErrors["password"] && <p className={styles.fieldError}>{formErrors["password"]}</p>}
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showRepeatPassword ? "text" : "password"}
                value={repeatPassword}
                onChange={(e) => handleInputChange("repeatPassword", e.target.value, setRepeatPassword)}
                className={styles.input}
                placeholder="Confirm Password"
              />
              <span onClick={() => setShowRepeatPassword(!showRepeatPassword)} className={styles.eyeIcon}>
                {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {formErrors["repeatPassword"] && <p className={styles.fieldError}>{formErrors["repeatPassword"]}</p>}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Address</h3>
            <p className={styles.sectionDescription}>Provide your practice’s location details for patients to find you.</p>
            <div className={styles.grid}>
              <div>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => handleInputChange("address.line1", e.target.value, setAddressLine1)}
                  className={styles.input}
                  placeholder="Address Line 1"
                />
                {formErrors["address.line1"] && <p className={styles.fieldError}>{formErrors["address.line1"]}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => handleInputChange("address.line2", e.target.value, setAddressLine2)}
                  className={styles.input}
                  placeholder="Address Line 2"
                />
                {formErrors["address.line2"] && <p className={styles.fieldError}>{formErrors["address.line2"]}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={addressLine3}
                  onChange={(e) => handleInputChange("address.line3", e.target.value, setAddressLine3)}
                  className={styles.input}
                  placeholder="Address Line 3"
                />
                {formErrors["address.line3"] && <p className={styles.fieldError}>{formErrors["address.line3"]}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => handleInputChange("address.city", e.target.value, setCity)}
                  className={styles.input}
                  placeholder="City/Town"
                />
                {formErrors["address.city"] && <p className={styles.fieldError}>{formErrors["address.city"]}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => handleInputChange("address.county", e.target.value, setCounty)}
                  className={styles.input}
                  placeholder="County"
                />
                {formErrors["address.county"] && <p className={styles.fieldError}>{formErrors["address.county"]}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => handleInputChange("address.postcode", e.target.value, setPostcode)}
                  className={styles.input}
                  placeholder="Postcode"
                />
                {formErrors["address.postcode"] && <p className={styles.fieldError}>{formErrors["address.postcode"]}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => handleInputChange("address.country", e.target.value, setCountry)}
                  className={styles.input}
                  placeholder="Country"
                />
                {formErrors["address.country"] && <p className={styles.fieldError}>{formErrors["address.country"]}</p>}
              </div>
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
                {(formErrors[`openingHours.${index}.open`] || formErrors[`openingHours.${index}.close`]) && (
                  <p className={styles.fieldError}>
                    {formErrors[`openingHours.${index}.open`] || formErrors[`openingHours.${index}.close`]}
                  </p>
                )}
              </div>
            ))}
            {formErrors["openingHours"] && <p className={styles.fieldError}>{formErrors["openingHours"]}</p>}
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
                {formErrors[`pricingMatrix.${service.name.toLowerCase()}`] && (
                  <p className={styles.fieldError}>{formErrors[`pricingMatrix.${service.name.toLowerCase()}`]}</p>
                )}
              </div>
            ))}
            {formErrors["allowedTypes"] && <p className={styles.fieldError}>{formErrors["allowedTypes"]}</p>}
            {formErrors["pricingMatrix"] && <p className={styles.fieldError}>{formErrors["pricingMatrix"]}</p>}
          </div>

          <p className={styles.infoText}>
            All information provided can be updated in your Practice Dashboard under Practice Preferences after verification by our staff.
          </p>
          <p className={styles.infoText}>
            A member of our admin team will review your application. You’ll receive an email once verification is complete.
          </p>

          <button type="submit" className={styles.submitButton}>
            Register Practice
          </button>
        </form>
      </div>
    </>
  );
}