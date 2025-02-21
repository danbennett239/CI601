"use client";

import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useUser } from "@/hooks/useUser";
import { usePractice } from "@/hooks/usePractice";
import { OpeningHoursItem, PracticePreferences } from "@/types/practice";
import ConfirmUnsavedPopup from "@/components/practice/settings/ConfirmUnsavedPopup/ConfirmUnsavedPopup";
import InfoTooltip from "@/components/InfoTooltip/InfoTooltip";
import styles from "./PracticeSettingsPage.module.css";

/** The shape of the local "info" for practice data */
interface PracticeInfoState {
  practice_name: string;
  email: string;
  phone_number: string;
  photo?: string | null;
  opening_hours: OpeningHoursItem[];
}

const PracticeSettings: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const {
    practice,
    loading: practiceLoading,
    error: practiceError,
    refreshPractice,
  } = usePractice(user?.practice_id);

  // Local info/prefs states
  const [info, setInfo] = useState<PracticeInfoState | null>(null);
  const [prefs, setPrefs] = useState<PracticePreferences | null>(null);

  // Original snapshots (for revert comparison)
  const [originalInfo, setOriginalInfo] = useState<PracticeInfoState | null>(null);
  const [originalPrefs, setOriginalPrefs] = useState<PracticePreferences | null>(null);

  // Photo states: the newly selected file & preview
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Each preference in local state
  const [hideDeleteConfirmation, setHideDeleteConfirmation] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableMobile, setEnableMobile] = useState(false);
  const [enableEmail, setEnableEmail] = useState(true);
  const [notifyOnBooking, setNotifyOnBooking] = useState(true);

  // Track unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  // Popup for unsaved changes
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);

  // For clickable circle
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /** On mount / when practice changes, populate local states */
  useEffect(() => {
    if (practice) {
      const newInfo: PracticeInfoState = {
        practice_name: practice.practice_name,
        email: practice.email,
        phone_number: practice.phone_number,
        photo: practice.photo ?? null,
        opening_hours: practice.opening_hours,
      };
      setInfo(newInfo);
      setOriginalInfo(newInfo);

      setPrefs(practice.practice_preferences);
      setOriginalPrefs(practice.practice_preferences);

      // Set preference checkboxes
      setHideDeleteConfirmation(practice.practice_preferences.hide_delete_confirmation);
      setEnableNotifications(practice.practice_preferences.enable_notifications);
      setEnableMobile(practice.practice_preferences.enable_mobile_notifications);
      setEnableEmail(practice.practice_preferences.enable_email_notifications);
      setNotifyOnBooking(practice.practice_preferences.notify_on_new_booking);

      // Reset any new photo states
      setNewPhotoFile(null);
      setPhotoPreview("");
    }
  }, [practice]);

  /** Compare local states to original for unsaved changes */
  useEffect(() => {
    if (!info || !prefs || !originalInfo || !originalPrefs) return;

    // Compare "info" fields
    const infoEqual =
      info.practice_name === originalInfo.practice_name &&
      info.email === originalInfo.email &&
      info.phone_number === originalInfo.phone_number &&
      (info.photo || "") === (originalInfo.photo || "") &&
      JSON.stringify(info.opening_hours) === JSON.stringify(originalInfo.opening_hours);

    // Compare "prefs" checkboxes
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

  // Helpers to update local state
  const handleFieldChange = <T extends keyof PracticeInfoState>(
    field: T,
    value: PracticeInfoState[T]
  ) => {
    setInfo((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // If notifications are turned off, also turn off sub-options
  const handleToggleNotifications = (value: boolean) => {
    setEnableNotifications(value);
    if (!value) {
      setEnableMobile(false);
      setEnableEmail(false);
      setNotifyOnBooking(false);
    }
  };

  /** On-click circle => trigger hidden file input */
  const handlePhotoCircleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /** Read new file and set local preview + store the file. */
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);

      // Generate a base64 preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /** Actual "Save" logic: if new photo is selected, upload & update DB, else just update DB. */
  const handleSave = async () => {
    if (!info) return;

    // (Optional) Validate opening hours
    try {
      const validateRes = await fetch(
        `/api/practice/${practice.practice_id}/settings/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opening_hours: info.opening_hours }),
        }
      );
      const validateData = await validateRes.json();
      if (!validateRes.ok || validateData.error) {
        toast.error(validateData.error || "Opening hours validation failed");
        return;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error validating opening hours";
      toast.error(message);
      return;
    }

    if (newPhotoFile) {
      try {
        const formData = new FormData();
        formData.append("file", newPhotoFile);

        // We also need the rest of the "settings" so the route can update them in DB. Could send them as JSON:
        const settingsPayload = {
          practice_name: info.practice_name,
          email: info.email,
          phone_number: info.phone_number,
          opening_hours: info.opening_hours,
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
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload/update photo"
        );
        return;
      }
    } else {
      // If no new photo, then just do a normal PUT of the rest of the settings
      try {
        const body = { settings: info }; // existing data with no new photo
        const res = await fetch(`/api/practice/${practice.practice_id}/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Error updating settings");
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Error updating practice settings"
        );
        return;
      }
    }

    try {
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

      // On success:
      // Refresh the practice data so the UI shows the updated photo and info
      await refreshPractice();
      toast.success("Settings saved successfully");

      // Clear out the newPhotoFile since it's now used
      setNewPhotoFile(null);
      setPhotoPreview("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error saving settings";
      toast.error(message);
    }
  };

  /** Revert changes => revert photo too */
  const handleCancel = () => {
    if (!practice || !originalInfo || !originalPrefs) return;

    // Revert info
    setInfo({
      practice_name: originalInfo.practice_name,
      email: originalInfo.email,
      phone_number: originalInfo.phone_number,
      photo: originalInfo.photo,
      opening_hours: originalInfo.opening_hours,
    });

    // Revert new photo states
    setNewPhotoFile(null);
    setPhotoPreview("");

    // Revert prefs
    setHideDeleteConfirmation(originalPrefs.hide_delete_confirmation);
    setEnableNotifications(originalPrefs.enable_notifications);
    setEnableMobile(originalPrefs.enable_mobile_notifications);
    setEnableEmail(originalPrefs.enable_email_notifications);
    setNotifyOnBooking(originalPrefs.notify_on_new_booking);
  };

  return (
    <div className={styles.settingsPage}>
      <ToastContainer />
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
        {/* Practice Information Section */}
        <section className={styles.section}>
          <h2>Practice Information</h2>
          <div className={styles.fieldGroup}>
            <label>Practice Photo</label>
            <div className={styles.photoSection}>
              <div className={styles.photoCircle} onClick={handlePhotoCircleClick}>
                {photoPreview ? (
                  <img
                    className={styles.photoPreview}
                    src={photoPreview}
                    alt="New Practice"
                  />
                ) : info.photo ? (
                  <img
                    className={styles.photoPreview}
                    src={info.photo}
                    alt="Current Practice"
                  />
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
          <div className={styles.fieldGroup}>
            <label>Opening Hours</label>
            {info.opening_hours.map((oh: OpeningHoursItem, idx: number) => (
              <div key={oh.dayName} className={styles.openingRow}>
                <span>{oh.dayName}</span>
                <input
                  type="time"
                  value={oh.open}
                  onChange={(e) => {
                    const newOH = [...info.opening_hours];
                    newOH[idx] = { ...newOH[idx], open: e.target.value };
                    handleFieldChange("opening_hours", newOH);
                  }}
                />
                <span>-</span>
                <input
                  type="time"
                  value={oh.close}
                  onChange={(e) => {
                    const newOH = [...info.opening_hours];
                    newOH[idx] = { ...newOH[idx], close: e.target.value };
                    handleFieldChange("opening_hours", newOH);
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Notification Preferences Section */}
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

        {/* System Preferences Section */}
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
