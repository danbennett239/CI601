"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './BookAppointmentPage.module.css';
import UserLoginForm from '@/components/UserLoginForm/UserLoginForm';
import UserRegisterForm from '@/components/UserRegisterForm/UserRegisterForm';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { AppointmentWithPractice } from '@/types/appointment';

export default function BookAppointment({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const [appointment, setAppointment] = useState<AppointmentWithPractice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false); // Toggle between login/register

  const { id } = React.use(params);
  const service = searchParams.get('service') || '';

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/api/appointment/${id}/details`);
        if (!response.ok) {
          throw new Error(`Failed to fetch appointment: ${response.status}`);
        }
        const data = await response.json();
        if (data.appointment.booked) {
          router.push('/my-appointments');
        } else {
          setAppointment(data.appointment);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch appointment";
        console.error("Fetch error:", message);
        setError(message);
      }
    };

    fetchAppointment();
  }, [id, router]);

  const handleLoginSuccess = async () => {
    const query = service ? `?service=${service}` : '';
    window.location.href = `/appointments/${id}/book${query}`;
  };

  const handleConfirmBooking = async () => {
    if (!user?.id || !user?.email) {
      setError("User not authenticated or email missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointment/${id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to book appointment: ${response.status}`);
      }

      setConfirmed(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to book appointment";
      console.error("Booking error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <div className={styles.loading}>Loading user...</div>;
  }

  if (!user) {
    return (
      <div className={styles.bookPage}>
        <h1 className={styles.title}>Sign In to Book</h1>
        <p className={styles.message}>Please sign in or register to proceed with your booking.</p>

        {showRegisterForm ? (
          <UserRegisterForm onSuccess={handleLoginSuccess} />
        ) : (
          <UserLoginForm onSuccess={handleLoginSuccess} />
        )}

        <p
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className={styles.registerLink}
          style={{ cursor: "pointer" }}
        >
          {showRegisterForm
            ? "Already have an account? Back to Log in"
            : "Don’t have an account? Register here"}
        </p>
      </div>
    );
  }

  if (!appointment) {
    return <div className={styles.loading}>Loading appointment...</div>;
  }

  if (confirmed) {
    return (
      <div className={styles.confirmationPage}>
        <h1 className={styles.confirmationTitle}>Booking Confirmed</h1>
        <p className={styles.confirmationMessage}>
          Please check your inbox for a confirmation email. You can view this appointment in{' '}
          <Link href="/my-appointments" className={styles.link}>My Appointments</Link>.
          After your appointment, you&apos;ll be able to leave a review or raise a dispute if needed.
        </p>
        <Link href="/my-appointments" className={styles.backButton}>Go to My Appointments</Link>
      </div>
    );
  }

  return (
    <div className={styles.bookPage}>
      <h1 className={styles.title}>Booking Summary</h1>
      <div className={styles.summaryContainer}>
        {/* Left: User Details */}
        <section className={styles.userSection}>
          <h2 className={styles.sectionTitle}>Your Information</h2>
          <div className={styles.card}>
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </section>

        {/* Right: Practice & Appointment Summary */}
        <section className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>Appointment & Practice</h2>
          <div className={styles.card}>
            <div className={styles.practiceHeader}>
              <img
                src={appointment.practice.photo || "/default-logo.png"}
                alt={`${appointment.practice.practice_name} logo`}
                className={styles.logo}
              />
              <h3 className={styles.practiceName}>{appointment.practice.practice_name}</h3>
            </div>
            <p><strong>Location:</strong> {appointment.practice.address.line1}, {appointment.practice.address.city}</p>
            <p><strong>Contact:</strong> {appointment.practice.email}</p>
            <p><strong>Date & Time:</strong> {new Date(appointment.start_time).toLocaleString()}</p>
            <p><strong>Type:</strong> {appointment.title}</p>
          </div>
        </section>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button
          onClick={handleConfirmBooking}
          className={styles.confirmButton}
          disabled={loading}
        >
          {loading ? "Confirming..." : "Confirm Booking"}
        </button>
        <Link href={`/appointments/${id}`} className={styles.cancelButton}>
          Cancel
        </Link>
      </div>
    </div>
  );
}