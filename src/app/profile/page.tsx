"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { useUser } from "@/hooks/useUser";
import styles from "./UserSettingsPage.module.css";
import { z } from "zod";

// Client-only components
const ConfirmUnsavedPopup = dynamic(
  () => import("@/components/practice/settings/ConfirmUnsavedPopup/ConfirmUnsavedPopup"),
  { ssr: false }
);

interface UserInfoState {
  email: string;
}

const userInfoSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const UserSettings: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [info, setInfo] = useState<UserInfoState>({ email: "" });
  const [originalInfo, setOriginalInfo] = useState<UserInfoState | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user && !hasInitialized) {
      const newInfo: UserInfoState = {
        email: user.email || "",
      };
      setInfo(newInfo);
      setOriginalInfo(newInfo);
      setHasInitialized(true);
    }
  }, [user, hasInitialized]);

  const handleFieldChange = (value: string) => {
    setInfo({ email: value });
    setUnsavedChanges(originalInfo ? value !== originalInfo.email : true);
  };

  const handleSave = async () => {
    if (!user) return;

    const validation = userInfoSchema.safeParse(info);
    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || "Invalid input";
      toast.error(errorMsg);
      return;
    }

    try {
      const body = {
        settings: {
          email: info.email,
        },
      };
      const res = await fetch(`/api/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Error updating email");
      }

      const userRes = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      if (!userRes.ok) {
        throw new Error("Failed to fetch updated user data");
      }
      const userData = await userRes.json();
      const updatedEmail = userData.user?.email || info.email;

      const newInfo: UserInfoState = { email: updatedEmail };
      setInfo(newInfo);
      setOriginalInfo(newInfo);
      setUnsavedChanges(false);
      toast.success("Email updated successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error updating email";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    if (!originalInfo) return;
    setInfo({ email: originalInfo.email });
    setUnsavedChanges(false);
  };

  if (!isMounted || userLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "user") {
    return <div>Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <h1>Manage Your Profile</h1>
      </div>
      <div className={styles.formContainer}>
        <section className={styles.section}>
          <h2>User Information</h2>
          <div className={styles.fieldGroup}>
            <label>Email</label>
            <input
              type="email"
              value={info.email}
              onChange={(e) => handleFieldChange(e.target.value)}
              data-cy="email-input"
            />
          </div>
        </section>

        <div className={styles.buttonRow}>
          <button
            className={unsavedChanges ? styles.saveButtonActive : styles.saveButton}
            onClick={handleSave}
            disabled={!unsavedChanges}
            data-cy="save-button"
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
            window.location.href = "/dashboard";
          }}
          onCancel={() => setShowUnsavedPopup(false)}
        />
      )}
    </div>
  );
};

export default UserSettings;
