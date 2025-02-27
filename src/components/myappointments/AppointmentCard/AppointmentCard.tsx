// components/myappointments/AppointmentCard/AppointmentCard.tsx
"use client";

import React from "react";
import InfoTooltip from "@/components/InfoTooltip/InfoTooltip";
import styles from "./AppointmentCard.module.css";

interface AppointmentCardProps {
  appointmentId: string;
  dateTime: string;
  service: string;
  practice: string;
  practiceAddress: string;
  practiceId: string;
  review?: { rating: number; comment: string; reviewId?: string };
  disputed?: boolean;
  onReview?: () => void; // Made optional
  onEditReview?: () => void; // Made optional
  onDispute?: (appointmentId: string) => void; // Made optional
}

export default function AppointmentCard({
  appointmentId,
  dateTime,
  service,
  practice,
  practiceAddress,
  practiceId,
  review,
  disputed,
  onReview,
  onEditReview,
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
          <div className={styles.reviewContainer}>
            <div className={styles.rating}>
              {renderStars(review.rating)}
            </div>
            {onEditReview && (
              <button onClick={onEditReview} className={styles.editButton}>
                Edit
              </button>
            )}
          </div>
        ) : (
          onReview && (
            <button onClick={onReview} className={styles.reviewButton}>
              Leave Review
            </button>
          )
        )}
        {onDispute && (
          <div className={styles.disputeContainer}>
            <button
              onClick={() => canDispute && onDispute(appointmentId)}
              className={`${styles.disputeButton} ${!canDispute ? styles.disabled : ''}`}
              disabled={!canDispute}
            >
              Raise Dispute
            </button>
            {!canDispute && (
              <InfoTooltip
                title="Dispute Period Expired"
                description="Disputes can only be raised within 5 calendar days after the appointment date."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}