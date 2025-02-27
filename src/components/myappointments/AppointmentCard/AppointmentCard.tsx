"use client";

import React from "react";
import InfoTooltip from "@/components/InfoTooltip/InfoTooltip";
import styles from "./AppointmentCard.module.css";

interface AppointmentCardProps {
  id: number;
  dateTime: string;
  service: string;
  practice: string;
  practiceAddress: string;
  review?: { rating: number; comment: string };
  disputed?: boolean;
  onReview: () => void;
  onDispute: (appointmentId: number) => void;
}

export default function AppointmentCard({
  id,
  dateTime,
  service,
  practice,
  practiceAddress,
  review,
  disputed,
  onReview,
  onDispute,
}: AppointmentCardProps) {
  const appointmentDate = new Date(dateTime);
  const now = new Date();
  const fiveDaysAfter = new Date(appointmentDate);
  fiveDaysAfter.setDate(fiveDaysAfter.getDate() + 5);
  const canDispute = !disputed && now <= fiveDaysAfter;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
      <>
        {"★".repeat(fullStars)}
        {halfStar ? "½" : ""}
        {"☆".repeat(emptyStars)}
      </>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.details}>
        <h3 className={styles.practice}>{practice}</h3>
        <p className={styles.dateTime}>{appointmentDate.toLocaleString()}</p>
        <p className={styles.service}><strong>Service:</strong> {service}</p>
        <p className={styles.address}><strong>Address:</strong> {practiceAddress}</p>
      </div>
      <div className={styles.actions}>
        {review ? (
          <div className={styles.rating}>
            {renderStars(review.rating)}
          </div>
        ) : (
          <button onClick={onReview} className={styles.reviewButton}>
            Leave Review
          </button>
        )}
        <div className={styles.disputeContainer}>
          {!canDispute && (
            <InfoTooltip
              title="Dispute Period Expired"
              description="Disputes can only be raised within 5 calendar days after the appointment date."
            />
          )}
          <button
            onClick={() => canDispute && onDispute(id)}
            className={`${styles.disputeButton} ${!canDispute ? styles.disabled : ''}`}
            disabled={!canDispute}
          >
            Raise Dispute
          </button>
        </div>
      </div>
    </div>
  );
}