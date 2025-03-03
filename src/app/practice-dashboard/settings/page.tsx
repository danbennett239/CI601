"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useUser } from "@/hooks/useUser";
import { usePractice } from "@/hooks/usePractice";
import { OpeningHoursItem, PracticePreferences } from "@/types/practice";
import ConfirmUnsavedPopup from "@/components/practice/settings/ConfirmUnsavedPopup/ConfirmUnsavedPopup";
import InfoTooltip from "@/components/InfoTooltip/InfoTooltip";
import { practiceSettingsSchema } from '@/schemas/practiceSchemas';
import styles from "./PracticeSettingsPage.module.css";

interface PracticeInfoState {
  practice_name: string;
  email: string;
  phone_number: string;
  photo?: string | null;
  opening_hours: OpeningHoursItem[];
  practice_services: Record<string, number>;
}

interface ServiceOption {
  name: string;
  enabled: boolean;
  price: number | null;
}

const PracticeSettings: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const {
    practice,
    loading: practiceLoading,
    error: practiceError,
    refreshPractice,
  } = usePractice(user?.practice_id);

  const [info, setInfo] = useState<PracticeInfoState | null>(null);
  const [prefs, setPrefs] = useState<PracticePreferences | null>(null);

  const [originalInfo, setOriginalInfo] = useState<PracticeInfoState | null>(null);
  const [originalPrefs, setOriginalPrefs] = useState<PracticePreferences | null>(null);

  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [hideDeleteConfirmation, setHideDeleteConfirmation] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableMobile, setEnableMobile] = useState(false);
  const [enableEmail, setEnableEmail] = useState(true);
  const [notifyOnBooking, setNotifyOnBooking] = useState(true);

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const serviceOptionsList = ["Checkup", "Cleaning", "Whitening", "Filling", "Emergency", "Extraction"];
  const [servicesOffered, setServicesOffered] = useState<ServiceOption[]>(
    serviceOptionsList.map((name) => ({
      name,
      enabled: false,
      price: null,
    }))
  );

  useEffect(() => {
    if (practice) {
      const newInfo: PracticeInfoState = {
        practice_name: practice.practice_name,
        email: practice.email,
        phone_number: practice.phone_number,
        photo: practice.photo ?? null,
        opening_hours: practice.opening_hours,
        practice_services: practice.practice_services || {},
      };
      setInfo(newInfo);
      if (!originalInfo) {
        setOriginalInfo(newInfo);
      }

      setPrefs(practice.practice_preferences);
      if (!originalPrefs) {
        setOriginalPrefs(practice.practice_preferences);
      }

      setHideDeleteConfirmation(practice.practice_preferences.hide_delete_confirmation);
      setEnableNotifications(practice.practice_preferences.enable_notifications);
      setEnableMobile(practice.practice_preferences.enable_mobile_notifications);
      setEnableEmail(practice.practice_preferences.enable_email_notifications);
      setNotifyOnBooking(practice.practice_preferences.notify_on_new_booking);

      setServicesOffered(
        serviceOptionsList.map((name) => ({
          name,
          enabled: !!practice.practice_services[name.toLowerCase()],
          price: practice.practice_services[name.toLowerCase()] || null,
        }))
      );

      setNewPhotoFile(null);
      setPhotoPreview("");
    }
  }, [practice]);

  useEffect(() => {
    if (!info || !prefs || !originalInfo || !originalPrefs) return;

    const infoEqual =
      info.practice_name === originalInfo.practice_name &&
      info.email === originalInfo.email &&
      info.phone_number === originalInfo.phone_number &&
      (info.photo || "") === (originalInfo.photo || "") &&
      JSON.stringify(info.opening_hours) === JSON.stringify(originalInfo.opening_hours) &&
      JSON.stringify(info.practice_services) === JSON.stringify(originalInfo.practice_services);

    const prefsEqual =
      hideDeleteConfirmation === originalPrefs.hide_delete_confirmation &&
      enableNotifications === originalPrefs.enable_notifications &&
      enableMobile === originalPrefs.enable_mobile_notifications &&
      enableEmail === originalPrefs.enable_email_notifications &&
      notifyOnBooking === originalPrefs.notify_on_new_booking;

    const photoChanged = newPhotoFile !== null;

    setUnsavedChanges(!(infoEqual && prefsEqual && !photoChanged));
  }, [
    info,
    prefs,
    newPhotoFile,
    hideDeleteConfirmation,
    enableNotifications,
    enableMobile,
    enableEmail,
    notifyOnBooking,
    originalInfo,
    originalPrefs,
  ]);

  if (userLoading || practiceLoading) return <div>Loading...</div>;
  if (!user || user.role !== "verified-practice") {
    return <div>Access Denied: You are not authorized to view this page.</div>;
  }
  if (!practice && practiceError) {
    return <div>Error: {practiceError}</div>;
  }
  if (!practice) {
    return <div>No Practice Found</div>;
  }
  if (!info || !prefs) {
    return <div>Loading practice details...</div>;
  }

  const handleFieldChange = <T extends keyof PracticeInfoState>(
    field: T,
    value: PracticeInfoState[T]
  ) => {
    setInfo((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleToggleNotifications = (value: boolean) => {
    setEnableNotifications(value);
    if (!value) {
      setEnableMobile(false);
      setEnableEmail(false);
      setNotifyOnBooking(false);
    }
  };

  const handlePhotoCircleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHoursChange = (index: number, field: "open" | "close", value: string) => {
    setInfo((prev) => {
      if (!prev) return null;
      const updatedHours = [...prev.opening_hours];
      updatedHours[index] = { ...updatedHours[index], [field]: value };
      return { ...prev, opening_hours: updatedHours };
    });
  };

  const handleClosedChange = (index: number, checked: boolean) => {
    setInfo((prev) => {
      if (!prev) return null;
      const updatedHours = [...prev.opening_hours];
      updatedHours[index] = {
        ...updatedHours[index],
        open: checked ? "closed" : "",
        close: checked ? "closed" : "",
      };
      return { ...prev, opening_hours: updatedHours };
    });
  };

  const handleServiceToggle = (index: number, checked: boolean) => {
    setServicesOffered((prev) => {
      const updated = [...prev];
      updated[index].enabled = checked;
      if (!checked) {
        updated[index].price = null;
      } else if (checked && originalInfo?.practice_services[updated[index].name.toLowerCase()] !== undefined) {
        updated[index].price = originalInfo.practice_services[updated[index].name.toLowerCase()];
      }
      return updated;
    });
    setInfo((prev) => {
      if (!prev) return null;
      const practiceServices = servicesOffered.reduce((acc, s, i) => {
        if (s.enabled || (i === index && checked)) {
          // acc[s.name.toLowerCase()] = s.price !== null ? s.price : (originalInfo?.practice_services[s.name.toLowerCase()] || null);
          acc[s.name.toLowerCase()] = s.price !== null 
          ? s.price 
          : (originalInfo?.practice_services?.[s.name.toLowerCase()] ?? 0);
        
        }
        return acc;
      }, {} as Record<string, number>);
      return { ...prev, practice_services: practiceServices };
    });
  };

  const handlePriceChange = (index: number, value: string) => {
    const price = value === "" ? null : parseFloat(value);
    setServicesOffered((prev) => {
      const updated = [...prev];
      updated[index].price = price;
      return updated;
    });
    setInfo((prev) => {
      if (!prev) return null;
      const practiceServices = { ...prev.practice_services };
      if (servicesOffered[index].enabled) {
        if (price !== null) {
          practiceServices[servicesOffered[index].name.toLowerCase()] = price;
        } else {
          delete practiceServices[servicesOffered[index].name.toLowerCase()];
        }
      }
      return { ...prev, practice_services: practiceServices };
    });
  };

  const handleSave = async () => {
    if (!info) return;
  
    // Validate servicesOffered directly
    const parseResult = practiceSettingsSchema.safeParse({
      practice_name: info.practice_name,
      email: info.email,
      phone_number: info.phone_number,
      photo: newPhotoFile || undefined,
      opening_hours: info.opening_hours.map(day => ({
        dayName: day.dayName,
        open: day.open,
        close: day.close,
      })),
      servicesOffered: servicesOffered,
    });
  
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map(err => err.message).join(', ');
      toast.error(`Validation failed: ${errorMessages}`);
      return;
    }
  
    // Construct practice_services from validated servicesOffered
    const practiceServices = servicesOffered.reduce((acc, s) => {
      if (s.enabled && s.price !== null) {
        acc[s.name.toLowerCase()] = s.price;
      }
      return acc;
    }, {} as Record<string, number>);
  
    const updatedInfo = { ...info, practice_services: practiceServices };
  
    try {
      // Validate opening hours (API check, if still needed alongside Zod)
      const validateRes = await fetch(
        `/api/practice/${practice.practice_id}/settings/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opening_hours: updatedInfo.opening_hours }),
        }
      );
      const validateData = await validateRes.json();
      if (!validateRes.ok || validateData.error) {
        throw new Error(validateData.error || "Opening hours validation failed");
      }
  
      // Update practice info and photo if applicable
      if (newPhotoFile) {
        const formData = new FormData();
        formData.append("file", newPhotoFile);
        const settingsPayload = {
          practice_name: updatedInfo.practice_name,
          email: updatedInfo.email,
          phone_number: updatedInfo.phone_number,
          opening_hours: updatedInfo.opening_hours,
          practice_services: updatedInfo.practice_services,
        };
        formData.append("settings", JSON.stringify(settingsPayload));
  
        const uploadRes = await fetch(`/api/practice/${practice.practice_id}`, {
          method: "PUT",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || uploadData.error) {
          throw new Error(uploadData.error || "Error updating photo");
        }
      } else {
        const body = { settings: updatedInfo };
        const res = await fetch(`/api/practice/${practice.practice_id}/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Error updating settings");
        }
      }
  
      // Update preferences
      const prefsRes = await fetch(`/api/practice/${practice.practice_id}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefs: {
            enable_notifications: enableNotifications,
            enable_mobile_notifications: enableMobile,
            enable_email_notifications: enableEmail,
            notify_on_new_booking: notifyOnBooking,
            hide_delete_confirmation: hideDeleteConfirmation,
          },
        }),
      });
      const prefsData = await prefsRes.json();
      if (!prefsRes.ok || prefsData.error) {
        throw new Error(prefsData.error || "Error updating preferences");
      }
  
      // **All updates succeeded, refresh practice and reset state**
      await refreshPractice();
  
      // **Ensure state updates are applied correctly**
      setOriginalInfo({ ...updatedInfo });
      setOriginalPrefs({
        ...prefs!,
        enable_notifications: enableNotifications,
        enable_mobile_notifications: enableMobile,
        enable_email_notifications: enableEmail,
        notify_on_new_booking: notifyOnBooking,
        hide_delete_confirmation: hideDeleteConfirmation,
      });
  
      setServicesOffered(
        serviceOptionsList.map((name) => ({
          name,
          enabled: !!updatedInfo.practice_services[name.toLowerCase()],
          price: updatedInfo.practice_services[name.toLowerCase()] || null,
        }))
      );
  
      setNewPhotoFile(null);
      setPhotoPreview("");
  
      // **Manually force recalculating unsavedChanges**
      setTimeout(() => {
        setUnsavedChanges(false);
      }, 0); // Allows React to re-render before recalculating
  
      toast.success("Settings saved successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error saving settings";
      toast.error(message);
    }
  };
  


  const handleCancel = () => {
    if (!practice || !originalInfo || !originalPrefs) return;

    setInfo({
      practice_name: originalInfo.practice_name,
      email: originalInfo.email,
      phone_number: originalInfo.phone_number,
      photo: originalInfo.photo,
      opening_hours: originalInfo.opening_hours,
      practice_services: originalInfo.practice_services,
    });

    setServicesOffered(
      serviceOptionsList.map((name) => ({
        name,
        enabled: !!originalInfo.practice_services[name.toLowerCase()],
        price: originalInfo.practice_services[name.toLowerCase()] || null,
      }))
    );

    setNewPhotoFile(null);
    setPhotoPreview("");

    setHideDeleteConfirmation(originalPrefs.hide_delete_confirmation);
    setEnableNotifications(originalPrefs.enable_notifications);
    setEnableMobile(originalPrefs.enable_mobile_notifications);
    setEnableEmail(originalPrefs.enable_email_notifications);
    setNotifyOnBooking(originalPrefs.notify_on_new_booking);
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <Link
          href="/practice-dashboard"
          onClick={(e) => {
            if (unsavedChanges) {
              e.preventDefault();
              setShowUnsavedPopup(true);
            }
          }}
          className={styles.backLink}
        >
          Back to Dashboard
        </Link>
        <h1>Manage Practice Information & Preferences</h1>
      </div>
      <div className={styles.formContainer}>
        <section className={styles.section}>
          <h2>Practice Information</h2>
          <div className={styles.fieldGroup}>
            <label>Practice Photo</label>
            <div className={styles.photoSection}>
              <div className={styles.photoCircle} onClick={handlePhotoCircleClick}>
                {photoPreview ? (
                  <img className={styles.photoPreview} src={photoPreview} alt="New Practice" />
                ) : info.photo ? (
                  <img className={styles.photoPreview} src={info.photo} alt="Current Practice" />
                ) : (
                  <span className={styles.photoIcon}>📷</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
                accept="image/*"
              />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label>Practice Name</label>
            <input
              type="text"
              value={info.practice_name}
              onChange={(e) => handleFieldChange("practice_name", e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>Email</label>
            <input
              type="email"
              value={info.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>Phone Number</label>
            <input
              type="text"
              value={info.phone_number}
              onChange={(e) => handleFieldChange("phone_number", e.target.value)}
            />
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Opening Hours</h2>
          </div>
          <p className={styles.sectionDescription}>Set your practice’s operating hours for each day of the week.</p>
          {info.opening_hours.map((dayObj, index) => (
            <div key={dayObj.dayName} className={styles.hoursRow}>
              <span className={styles.dayLabel}>{dayObj.dayName}</span>
              <div className={styles.timeGroup}>
                <input
                  type="time"
                  value={dayObj.open === "closed" ? "" : dayObj.open}
                  onChange={(e) => handleHoursChange(index, "open", e.target.value)}
                  className={styles.timeInput}
                  disabled={dayObj.open === "closed"}
                />
                <span className={styles.timeSeparator}>—</span>
                <input
                  type="time"
                  value={dayObj.close === "closed" ? "" : dayObj.close}
                  onChange={(e) => handleHoursChange(index, "close", e.target.value)}
                  className={styles.timeInput}
                  disabled={dayObj.close === "closed"}
                />
              </div>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={dayObj.open === "closed" && dayObj.close === "closed"}
                  onChange={(e) => handleClosedChange(index, e.target.checked)}
                />
                Closed
              </label>
            </div>
          ))}
        </section>

        <hr className={styles.divider} />

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Services Offered</h2>
          </div>
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
        </section>

        <hr className={styles.divider} />

        <section className={styles.section}>
          <h2>Notification Preferences</h2>
          <div className={styles.fieldGroup}>
            <label>
              Enable Notifications{" "}
              <InfoTooltip
                title="Enable Notifications"
                description="Master switch to enable or disable all notifications."
              />
            </label>
            <input
              type="checkbox"
              checked={enableNotifications}
              onChange={(e) => handleToggleNotifications(e.target.checked)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>
              Enable Mobile Notifications{" "}
              <InfoTooltip
                title="Enable Mobile Notifications"
                description="Enable push/SMS notifications on your mobile device."
              />
            </label>
            <input
              type="checkbox"
              checked={enableMobile}
              onChange={(e) => setEnableMobile(e.target.checked)}
              disabled={!enableNotifications}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>
              Enable Email Notifications{" "}
              <InfoTooltip
                title="Enable Email Notifications"
                description="Receive email notifications for important updates."
              />
            </label>
            <input
              type="checkbox"
              checked={enableEmail}
              onChange={(e) => setEnableEmail(e.target.checked)}
              disabled={!enableNotifications}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>
              Notify on New Booking{" "}
              <InfoTooltip
                title="Notify on New Booking"
                description="Receive a notification when a new appointment is booked."
              />
            </label>
            <input
              type="checkbox"
              checked={notifyOnBooking}
              onChange={(e) => setNotifyOnBooking(e.target.checked)}
              disabled={!enableNotifications}
            />
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.section}>
          <h2>System Preferences</h2>
          <div className={styles.fieldGroup}>
            <label>
              Hide Delete Confirmation{" "}
              <InfoTooltip
                title="Hide Delete Confirmation"
                description="Enable this to bypass the 'Are you sure?' prompt when deleting items."
              />
            </label>
            <input
              type="checkbox"
              checked={hideDeleteConfirmation}
              onChange={(e) => setHideDeleteConfirmation(e.target.checked)}
            />
          </div>
        </section>

        <div className={styles.buttonRow}>
          <button
            className={unsavedChanges ? styles.saveButtonActive : styles.saveButton}
            onClick={handleSave}
          >
            Save
          </button>
          <button className={styles.cancelButton} onClick={handleCancel}>
            Revert
          </button>
        </div>
      </div>

      {showUnsavedPopup && (
        <ConfirmUnsavedPopup
          onConfirm={() => {
            setShowUnsavedPopup(false);
            window.location.href = "/practice-dashboard";
          }}
          onCancel={() => setShowUnsavedPopup(false)}
        />
      )}
    </div>
  );
};

export default PracticeSettings;