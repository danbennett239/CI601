"use client";

import { notFound } from 'next/navigation';
import styles from './AppointmentDetailsPage.module.css';
import Link from 'next/link';

// Dummy data (replace with backend fetch later)
const appointments = [
  { id: 1, practice: "Smile Dental", time: "2025-02-25 10:00", type: "Cleaning", price: 80, distance: 2.5, image: "/dummy1.jpg", description: "A routine cleaning to keep your smile bright." },
  { id: 2, practice: "Bright Teeth", time: "2025-02-25 14:30", type: "Check-up", price: 60, distance: 5.0, image: "/dummy2.jpg", description: "A comprehensive dental check-up." },
  { id: 3, practice: "Perfect Smile", time: "2025-02-26 11:15", type: "Filling", price: 120, distance: 1.8, image: "/dummy3.jpg", description: "Quick and painless cavity filling." },
  { id: 4, practice: "Glow Dental", time: "2025-02-27 09:30", type: "Whitening", price: 150, distance: 3.2, image: "/dummy4.jpg", description: "Professional teeth whitening." },
  { id: 5, practice: "Healthy Smiles", time: "2025-02-27 15:00", type: "Check-up", price: 70, distance: 4.5, image: "/dummy5.jpg", description: "Routine dental health check." },
];

export default async function AppointmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = appointments.find((appt) => appt.id === Number(id));

  if (!appointment) {
    notFound();
  }

  const handleBook = () => {
    alert(`Booking appointment ${appointment.id} - Implement backend logic here!`);
  };

  return (
    <div className={styles.detailPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>{appointment.practice}</h1>
        <p className={styles.subtitle}>{appointment.type} Appointment</p>
      </header>

      <div className={styles.content}>
        <img src={appointment.image} alt={appointment.practice} className={styles.image} />
        <div className={styles.details}>
          <p><strong>Date & Time:</strong> {new Date(appointment.time).toLocaleString()}</p>
          <p><strong>Type:</strong> {appointment.type}</p>
          <p><strong>Price:</strong> £{appointment.price}</p>
          <p><strong>Distance:</strong> {appointment.distance} miles away</p>
          <p><strong>Description:</strong> {appointment.description}</p>
          <div className={styles.actions}>
            <button onClick={handleBook} className={styles.bookButton}>
              Book Now
            </button>
            <Link href="/search" className={styles.backButton}>
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}