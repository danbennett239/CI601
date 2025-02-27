"use client";

import React, { useState } from "react";
import styles from "./EditReviewPopup.module.css";

interface EditReviewPopupProps {
  appointmentId: string;
  initialRating: number;
  initialComment: string;
  onClose: () => void;
  onSubmit: (appointmentId: string, rating: number, comment: string) => void;
}

export default function EditReviewPopup({
  appointmentId,
  initialRating,
  initialComment,
  onClose,
  onSubmit,
}: EditReviewPopupProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

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
        <h3 className={styles.title}>Edit Review</h3>
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
            Save
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}