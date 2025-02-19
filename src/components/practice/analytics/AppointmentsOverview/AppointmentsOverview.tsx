"use client";

import React from "react";
import styles from "./AppointmentsOverview.module.css";

interface Appointment {
  appointment_id: string;
  start_time: string;
  end_time: string;
  booked?: boolean;
}

interface AppointmentsOverviewProps {
  appointments: Appointment[];
}

export default function AppointmentsOverview({
  appointments,
}: AppointmentsOverviewProps) {
  const total = appointments.length;
  const booked = appointments.filter((a) => a.booked).length;
  const unbooked = total - booked;

  return (
    <div className={styles.overviewContainer}>
      <div className={styles.card}>
        <h3>Total Appointments</h3>
        <p>{total}</p>
      </div>

      <div className={styles.card}>
        <h3>Booked</h3>
        <p>{booked}</p>
      </div>

      <div className={styles.card}>
        <h3>Unbooked</h3>
        <p>{unbooked}</p>
      </div>
    </div>
  );
}
