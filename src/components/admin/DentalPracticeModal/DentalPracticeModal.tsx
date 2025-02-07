// components/admin/DentalPracticeModal.tsx
"use client";

import React, { useState } from 'react';
import styles from './DentalPracticeModal.module.css';

interface Practice {
  practice_id: string;
  practice_name: string;
  email: string;
  phone_number: string;
  photo?: string;
  address: any;
  opening_hours: any;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
}

interface DentalPracticeModalProps {
  practice: Practice;
  onClose: () => void;
}

const DentalPracticeModal: React.FC<DentalPracticeModalProps> = ({ practice, onClose }) => {
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
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>{practice.practice_name}</h2>
        <p><strong>Email:</strong> {practice.email}</p>
        <p><strong>Phone:</strong> {practice.phone_number}</p>
        <p><strong>Address:</strong> {JSON.stringify(practice.address)}</p>
        <p><strong>Opening Hours:</strong> {JSON.stringify(practice.opening_hours)}</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttonGroup}>
          {/* Only show approve/deny if the practice is not yet verified */}
          {!practice.verified && (
            <>
              <button onClick={handleApprove} disabled={processing}>Approve</button>
              <button onClick={handleDeny} disabled={processing}>Deny</button>
            </>
          )}
          <button onClick={onClose} disabled={processing}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default DentalPracticeModal;
