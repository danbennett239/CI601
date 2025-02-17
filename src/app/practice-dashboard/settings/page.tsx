"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useUser } from "@/hooks/useUser";
import { usePractice } from "@/hooks/usePractice";
import { OpeningHoursItem, PracticePreferences } from "@/types/practice";
import ConfirmUnsavedPopup from "@/components/practice/settings/ConfirmUnsavedPopup/ConfirmUnsavedPopup";
import InfoTooltip from "@/components/InfoTooltip/InfoTooltip";  // Adjust import path
import styles from "./PracticeSettingsPage.module.css";

const PracticeSettings: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const {
    practice,
    loading: practiceLoading,
    error: practiceError,
    refreshPractice,
  } = usePractice(user?.practice_id);

  // Local "info" state
  const [info, setInfo] = useState<{
    practice_name: string;
    email: string;
    phone_number: string;
    photo?: string | null;
    opening_hours: OpeningHoursItem[];
  } | null>(null);

  // Local "prefs" state
  const [prefs, setPrefs] = useState<PracticePreferences | null>(null);

  // Original states for comparison
  const [originalInfo, setOriginalInfo] = useState<
    | {
        practice_name: string;
        email: string;
        phone_number: string;
        photo?: string | null;
        opening_hours: OpeningHoursItem[];
      }
    | null
  >(null);

  const [originalPrefs, setOriginalPrefs] = useState<PracticePreferences | null>(null);

  // Each preference individually controlled in local state
  const [hideDeleteConfirmation, setHideDeleteConfirmation] = useState<boolean>(false);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true);
  const [enableMobile, setEnableMobile] = useState<boolean>(false);
  const [enableEmail, setEnableEmail] = useState<boolean>(true);
  const [notifyOnBooking, setNotifyOnBooking] = useState<boolean>(true);

  // Trigger for unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  // For the popup that appears when navigating away with unsaved changes
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);

  useEffect(() => {
    if (practice) {
      // Set local state from practice
      const newInfo = {
        practice_name: practice.practice_name,
        email: practice.email,
        phone_number: practice.phone_number,
        photo: practice.photo ?? "",
        opening_hours: practice.opening_hours,
      };
      setInfo(newInfo);
      setOriginalInfo(newInfo); // store copy for comparison

      setPrefs(practice.practice_preferences);
      setOriginalPrefs(practice.practice_preferences);

      // Initialize local checkboxes from preferences
      setHideDeleteConfirmation(practice.practice_preferences.hide_delete_confirmation);
      setEnableNotifications(practice.practice_preferences.enable_notifications);
      setEnableMobile(practice.practice_preferences.enable_mobile_notifications);
      setEnableEmail(practice.practice_preferences.enable_email_notifications);
      setNotifyOnBooking(practice.practice_preferences.notify_on_new_booking);
    }
  }, [practice]);

  // Compare the current state with the original state to determine unsaved changes
  useEffect(() => {
    if (!practice || !originalInfo || !originalPrefs || !info || !prefs) return;

    // Compare info
    const infoEqual =
      info.practice_name === originalInfo.practice_name &&
      info.email === originalInfo.email &&
      info.phone_number === originalInfo.phone_number &&
      (info.photo || "") === (originalInfo.photo || "") &&
      JSON.stringify(info.opening_hours) === JSON.stringify(originalInfo.opening_hours);

    // Compare prefs
    const prefsEqual =
      hideDeleteConfirmation === originalPrefs.hide_delete_confirmation &&
      enableNotifications === originalPrefs.enable_notifications &&
      enableMobile === originalPrefs.enable_mobile_notifications &&
      enableEmail === originalPrefs.enable_email_notifications &&
      notifyOnBooking === originalPrefs.notify_on_new_booking;

    setUnsavedChanges(!(infoEqual && prefsEqual));
  }, [
    info,
    hideDeleteConfirmation,
    enableNotifications,
    enableMobile,
    enableEmail,
    notifyOnBooking,
    practice,
    originalInfo,
    originalPrefs,
    prefs,
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

  // Field updates
  const handleFieldChange = <T extends keyof typeof info>(
    field: T,
    value: typeof info[T]
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

  const handleSave = async () => {
    if (!info) return;

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

    try {
      const settingsRes = await fetch(`/api/practice/${practice.practice_id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: info }),
      });
      const settingsData = await settingsRes.json();
      if (!settingsRes.ok || settingsData.error) {
        toast.error(settingsData.error || "Error updating settings");
        return;
      }

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
        toast.error(prefsData.error || "Error updating preferences");
        return;
      }

      await refreshPractice();
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
    });

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
              e.preventDefault(); // Stop Link from auto-navigating
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
            <label>Photo URL</label>
            <input
              type="text"
              value={info.photo || ""}
              onChange={(e) => handleFieldChange("photo", e.target.value)}
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
