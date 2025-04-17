import { redirect } from "next/navigation";
import styles from "./AppointmentDetailsPage.module.css";
import Link from "next/link";
import { AppointmentWithPractice } from "@/types/appointment";

async function fetchAppointment(id: string): Promise<AppointmentWithPractice> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/appointment/${id}/details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    redirect(`/appointments/error?status=${response.status}`);
  }

  const data = await response.json();
  return data.appointment;
}

interface AppointmentDetailProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; appointmentType?: string }>;
}

export default async function AppointmentDetail({ params, searchParams }: AppointmentDetailProps) {
  const { id } = await params;
  const { from, appointmentType: searchedType } = await searchParams;

  const appointment = await fetchAppointment(id);

  if (appointment.booked) {
    redirect("/appointments/error?status=404");
  }

  const avgRating = appointment.practice.practice_reviews_aggregate.aggregate.avg.rating || "N/A";
  const reviewCount = appointment.practice.practice_reviews_aggregate.aggregate.count || 0;

  const backLink = from === "home" ? "/" : from === "search" ? "/search" : "/search";
  const backText = from === "home" ? "Back to Home" : from === "search" ? "Back to Search" : "Back to Search";

  const services: [string, number][] = Object.entries(appointment.services).sort(([a], [b]) => a.localeCompare(b));
  const defaultService = searchedType && appointment.services[searchedType] ? searchedType : services[0]?.[0] || "";
  const primaryService: [string, number][] = searchedType && from === "search" && appointment.services[searchedType] !== undefined
    ? [[searchedType, appointment.services[searchedType]]]
    : [];
  const additionalServices = from === "search" ? services.filter(([type]) => type !== searchedType) : services;

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Book Appointment with {appointment.practice.practice_name}</h1>
        <p className={styles.subtitle}>
          Review the appointment and practice details, explore available service options, and proceed to checkout.
        </p>
      </header>

      <div className={styles.detailPage}>
        <div className={styles.mainContent}>
          <div className={styles.content}>
            <section className={styles.appointmentSection}>
              <h2 className={styles.sectionTitle}>Appointment Details</h2>
              <div className={styles.card}>
                <p><strong>Date & Time:</strong> {new Date(appointment.start_time).toLocaleString()}</p>
                {from === "search" && primaryService.length > 0 && (
                  <>
                    <h3 className={styles.subheading}>Service Selected in Appointment Search</h3>
                    <div className={styles.services}>
                      {primaryService.map(([type, price]) => (
                        <div key={type} className={styles.service}>
                          <span className={styles.type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                          <span className={styles.price}>£{price}</span>
                        </div>
                      ))}
                    </div>
                    {additionalServices.length > 0 && (
                      <>
                        <h3 className={styles.subheading}>Alternative Services Available</h3>
                        <div className={styles.services}>
                          {additionalServices.map(([type, price]) => (
                            <div key={type} className={styles.service}>
                              <span className={styles.type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                              <span className={styles.price}>£{price}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                {from !== "search" && (
                  <>
                    <h3 className={styles.subheading}>Available Services</h3>
                    <div className={styles.services}>
                      {services.map(([type, price]) => (
                        <div key={type} className={styles.service}>
                          <span className={styles.type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                          <span className={styles.price}>£{price}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

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
                <p className={styles.contactItem}>
                  <strong>Location:</strong> {appointment.practice.address.line1}, {appointment.practice.address.city}, {appointment.practice.address.postcode}
                </p>
                <p className={styles.contactItem}><strong>Phone:</strong> {appointment.practice.phone_number || "N/A"}</p>
                <p className={styles.contactItem}><strong>Email:</strong> {appointment.practice.email}</p>
                <p className={styles.contactItem}><strong>Rating:</strong> {avgRating} ({reviewCount} reviews)</p>
              </div>
            </section>
          </div>

          <div className={styles.serviceSelectorWrapper}>
            <div className={styles.serviceSelector}>
              <label htmlFor="serviceType" className={styles.serviceLabel}>Selected Service:</label>
              <select
                id="serviceType"
                defaultValue={defaultService}
                className={styles.serviceDropdown}
              >
                {services.map(([type, price]) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} - £{price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href={`/appointments/${appointment.appointment_id}/book?service=${defaultService}`} className={styles.bookButton} data-cy="proceed-to-checkout-button">
              Proceed to Checkout
            </Link>
            <Link href={backLink} className={styles.backButton}>
              {backText}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}