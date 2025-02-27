"use client";

import React, { useState } from "react";
import styles from "./ReviewPopup.module.css";

interface ReviewPopupProps {
  appointmentId: number;
  onClose: () => void;
  onSubmit: (appointmentId: number, rating: number, comment: string) => void;
}

export default function ReviewPopup({ appointmentId, onClose, onSubmit }: ReviewPopupProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(appointmentId, rating, comment);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <h3 className={styles.title}>Leave a Review</h3>
        <div className={styles.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className={styles.starContainer}>
              <span
                className={`${styles.star} ${star - 0.5 <= rating ? styles.filled : ''}`}
                onClick={() => handleStarClick(star - 0.5)}
              >
                ★
              </span>
              <span
                className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            </div>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Your feedback..."
          className={styles.comment}
        />
        <div className={styles.actions}>
          <button onClick={handleSubmit} className={styles.submitButton} disabled={rating === 0}>
            Submit
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}