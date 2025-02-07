// components/admin/DentalPracticeModal/DentalPracticeModal.tsx
"use client";

import React, { useState } from "react";
import { approvePractice, denyPractice } from "@/lib/services/practiceService";
import styles from "./DentalPracticeModal.module.css";
import { Practice } from "@/types/practice";

interface DentalPracticeModalProps {
  practice: Practice;
  onClose: () => void;
}

const DentalPracticeModal: React.FC<DentalPracticeModalProps> = ({
  practice,
  onClose,
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setProcessing(true);
    setError(null);
    try {
      const response = await fetch("/api/practice/approve", {
        method: "POST",
        body: JSON.stringify({ practiceId: practice.practice_id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve practice.");
      }
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Approval failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    setProcessing(true);
    setError(null);
    try {
      const response = await fetch("/api/practice/deny", {
        method: "POST",
        body: JSON.stringify({ practiceId: practice.practice_id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deny practice.");
      }
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Denial failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>{practice.practice_name}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.body}>
          {practice.photo && (
            <img
              src={practice.photo}
              alt={practice.practice_name}
              className={styles.photo}
            />
          )}
          <div className={styles.details}>
            <p>
              <strong>Email:</strong> {practice.email}
            </p>
            <p>
              <strong>Phone:</strong> {practice.phone_number}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {typeof practice.address === "object"
                ? JSON.stringify(practice.address)
                : practice.address}
            </p>
            <p>
              <strong>Opening Hours:</strong>{" "}
              {typeof practice.opening_hours === "object"
                ? JSON.stringify(practice.opening_hours)
                : practice.opening_hours}
            </p>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          {!practice.verified && (
            <>
              <button
                onClick={handleApprove}
                disabled={processing}
                className={styles.approveButton}
              >
                Approve
              </button>
              <button
                onClick={handleDeny}
                disabled={processing}
                className={styles.denyButton}
              >
                Deny
              </button>
            </>
          )}
          <button
            onClick={onClose}
            disabled={processing}
            className={styles.closeModalButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DentalPracticeModal;
