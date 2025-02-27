"use client";

import React, { useState } from "react";
import AppointmentCard from "@/components/myappointments/AppointmentCard/AppointmentCard";
import ReviewPopup from "@/components/myappointments/ReviewPopup/ReviewPopup";
import styles from "./MyAppointmentsPage.module.css";

interface Appointment {
  id: number;
  dateTime: string;
  service: string;
  practice: string;
  practiceAddress: string;
  review?: { rating: number; comment: string };
  disputed?: boolean;
}

const mockAppointments: Appointment[] = [
  {
    id: 1,
    dateTime: "2025-02-20T10:00:00",
    service: "Cleaning",
    practice: "Smile Dental",
    practiceAddress: "123 Happy St, London",
  },
  {
    id: 2,
    dateTime: "2025-02-22T14:30:00",
    service: "Check-up",
    practice: "Bright Teeth",
    practiceAddress: "456 Shine Rd, Manchester",
    review: { rating: 4.5, comment: "Great service, very thorough!" },
  },
  {
    id: 3,
    dateTime: "2025-02-25T09:15:00",
    service: "Filling",
    practice: "Perfect Smile",
    practiceAddress: "789 Smile Ave, Birmingham",
  },
];

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [reviewPopupId, setReviewPopupId] = useState<number | null>(null);

  const handleReviewSubmit = (appointmentId: number, rating: number, comment: string) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === appointmentId ? { ...appt, review: { rating, comment } } : appt
      )
    );
    setReviewPopupId(null);
  };

  const handleDispute = (appointmentId: number) => {
    alert(`Dispute raised for appointment ${appointmentId} - Implement backend logic here!`);
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === appointmentId ? { ...appt, disputed: true } : appt))
    );
  };

  const closeReviewPopup = () => {
    setReviewPopupId(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Appointments</h1>
        <p className={styles.subtitle}>View and manage your booked dental appointments</p>
      </header>

      <div className={styles.container}>
        {appointments.length > 0 ? (
          <div className={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                {...appointment}
                onReview={() => setReviewPopupId(appointment.id)}
                onDispute={handleDispute}
              />
            ))}
          </div>
        ) : (
          <p className={styles.noAppointments}>You have no booked appointments.</p>
        )}
        {reviewPopupId && (
          <ReviewPopup
            appointmentId={reviewPopupId}
            onClose={closeReviewPopup}
            onSubmit={handleReviewSubmit}
          />
        )}
      </div>
    </div>
  );
}