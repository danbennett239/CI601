import { redirect } from 'next/navigation';
import styles from './AppointmentDetailsPage.module.css';
import Link from 'next/link';

async function fetchAppointment(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/appointment/${id}/details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // Redirect to error page with status code as query param
    redirect(`/appointments/error?status=${response.status}`);
  }

  const data = await response.json();
  return data.appointment;
}

export default async function AppointmentDetail({ params }: { params: { id: string } }) {
  const appointment = await fetchAppointment(params.id);

  if (!appointment || appointment.booked) {
    redirect('/appointments/error?status=404'); // Handle booked appointments as unavailable
  }

  const avgRating = appointment.practice.practice_reviews_aggregate.aggregate.avg.rating || "N/A";
  const reviewCount = appointment.practice.practice_reviews_aggregate.aggregate.count || 0;

  return (
    <div className={styles.detailPage}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{appointment.title} Appointment</h1>
          <p className={styles.subtitle}>Book with {appointment.practice.practice_name}</p>
        </div>
      </header>

      <div className={styles.content}>
        {/* Appointment Section */}
        <section className={styles.appointmentSection}>
          <h2 className={styles.sectionTitle}>Appointment Details</h2>
          <div className={styles.card}>
            <p><strong>Date & Time:</strong> {new Date(appointment.start_time).toLocaleString()}</p>
            <p><strong>Type:</strong> {appointment.title}</p>
          </div>
        </section>

        {/* Practice Section */}
        <section className={styles.practiceSection}>
          <h2 className={styles.sectionTitle}>Practice Information</h2>
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
            <p><strong>Contact:</strong> {appointment.practice.phone_number || "N/A"} | {appointment.practice.email}</p>
            <p><strong>Rating:</strong> {avgRating} ({reviewCount} reviews)</p>
          </div>
        </section>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href={`/appointments/${appointment.appointment_id}/book`} className={styles.bookButton}>
            Book Appointment
          </Link>
          <Link href="/search" className={styles.backButton}>
            Back to Search
          </Link>
        </div>
      </div>
    </div>
  );
}