// app/my-appointments/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import AppointmentCard from "@/components/myappointments/AppointmentCard/AppointmentCard";
import ReviewPopup from "@/components/myappointments/ReviewPopup/ReviewPopup";
import EditReviewPopup from "@/components/myappointments/EditReviewPopup/EditReviewPopup";
import styles from "./MyAppointmentsPage.module.css";

interface Review {
  rating: number;
  comment: string;
  reviewId?: string;
}

interface Appointment {
  appointmentId: string;
  dateTime: string;
  service: string;
  practice: string;
  practiceAddress: string;
  practiceId: string;
  review?: Review;
  disputed?: boolean;
}

export default function MyAppointmentsPage() {
  const { user, loading } = useUser();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [previousAppointments, setPreviousAppointments] = useState<Appointment[]>([]);
  const [reviewPopupId, setReviewPopupId] = useState<string | null>(null);
  const [editReviewPopupId, setEditReviewPopupId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/appointment?userId=${encodeURIComponent(user.id)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch appointments");
        }
        const data = await response.json();
        const fetchedAppointments: Appointment[] = data.appointments.map((appt: any) => ({
          appointmentId: appt.appointment_id,
          dateTime: appt.start_time,
          service: appt.title,
          practice: appt.practice.practice_name,
          practiceAddress: `${appt.practice.address.line1}, ${appt.practice.address.city}, ${appt.practice.address.postcode}`,
          practiceId: appt.practice_id,
          review: appt.practice_review
            ? {
                rating: appt.practice_review.rating,
                comment: appt.practice_review.comment || "",
                reviewId: appt.practice_review.review_id,
              }
            : undefined,
          disputed: false,
        }));

        const now = new Date();
        const upcoming = fetchedAppointments.filter((appt) => new Date(appt.dateTime) > now);
        const previous = fetchedAppointments.filter((appt) => new Date(appt.dateTime) <= now);

        setUpcomingAppointments(upcoming);
        setPreviousAppointments(previous);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setFetchError(error instanceof Error ? error.message : "Failed to load appointments");
      }
    };

    if (!loading && user) {
      fetchAppointments();
    }
  }, [user, loading]);

  const handleReviewSubmit = async (appointmentId: string, rating: number, comment: string) => {
    try {
      const appointment = previousAppointments.find((appt) => appt.appointmentId === appointmentId);
      if (!appointment) throw new Error("Appointment not found");

      const response = await fetch("/api/practice/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          practiceId: appointment.practiceId,
          appointmentId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      const result = await response.json();
      setPreviousAppointments((prev) =>
        prev.map((appt) =>
          appt.appointmentId === appointmentId
            ? { ...appt, review: { rating, comment, reviewId: result.review.review_id } }
            : appt
        )
      );
      setReviewPopupId(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error instanceof Error ? error.message : "Failed to submit review");
    }
  };

  const handleEditReviewSubmit = async (appointmentId: string, rating: number, comment: string) => {
    try {
      const appointment = previousAppointments.find((appt) => appt.appointmentId === appointmentId);
      if (!appointment || !appointment.review?.reviewId) throw new Error("Review not found");

      const response = await fetch("/api/practice/review", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: appointment.review.reviewId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update review");
      }

      const result = await response.json();
      setPreviousAppointments((prev) =>
        prev.map((appt) =>
          appt.appointmentId === appointmentId ? { ...appt, review: { ...appt.review, rating, comment } } : appt
        )
      );
      setEditReviewPopupId(null);
    } catch (error) {
      console.error("Error updating review:", error);
      alert(error instanceof Error ? error.message : "Failed to update review");
    }
  };

  const handleDispute = (appointmentId: string) => {
    alert(`Dispute raised for appointment ${appointmentId} - Implement backend logic here!`);
    setPreviousAppointments((prev) =>
      prev.map((appt) => (appt.appointmentId === appointmentId ? { ...appt, disputed: true } : appt))
    );
  };

  const closeReviewPopup = () => {
    setReviewPopupId(null);
  };

  const closeEditReviewPopup = () => {
    setEditReviewPopupId(null);
  };

  if (loading) {
    return <div className={styles.page}>Loading...</div>;
  }

  if (!user) {
    return <div className={styles.page}>Please sign in to view your appointments.</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Appointments</h1>
        <p className={styles.subtitle}>View and manage your booked dental appointments</p>
      </header>

      <div className={styles.container}>
        {fetchError ? (
          <p className={styles.error}>{fetchError}</p>
        ) : (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Upcoming Appointments</h2>
              {upcomingAppointments.length > 0 ? (
                <div className={styles.appointmentsList}>
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.appointmentId}
                      {...appointment}
                      onReview={undefined} // No review for upcoming
                      onEditReview={undefined} // No edit for upcoming
                      onDispute={undefined} // No dispute for upcoming
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.noAppointments}>No upcoming appointments.</p>
              )}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Previous Appointments</h2>
              {previousAppointments.length > 0 ? (
                <div className={styles.appointmentsList}>
                  {previousAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.appointmentId}
                      {...appointment}
                      onReview={() => setReviewPopupId(appointment.appointmentId)}
                      onEditReview={() => setEditReviewPopupId(appointment.appointmentId)}
                      onDispute={handleDispute}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.noAppointments}>No previous appointments.</p>
              )}
            </section>

            {reviewPopupId && (
              <ReviewPopup
                appointmentId={reviewPopupId}
                onClose={closeReviewPopup}
                onSubmit={handleReviewSubmit}
              />
            )}
            {editReviewPopupId && (
              <EditReviewPopup
                appointmentId={editReviewPopupId}
                onClose={closeEditReviewPopup}
                onSubmit={handleEditReviewSubmit}
                initialRating={previousAppointments.find((appt) => appt.appointmentId === editReviewPopupId)?.review?.rating || 0}
                initialComment={previousAppointments.find((appt) => appt.appointmentId === editReviewPopupId)?.review?.comment || ""}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}