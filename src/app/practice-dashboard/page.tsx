// app/practice-dashboard/page.tsx
import React from "react";
import AdminPanelCard from "@/components/admin/AdminPanelCard/AdminPanelCard";
import styles from "./PracticeDashboardPage.module.css";

export default function PracticeDashboard() {
  return (
    <div className={styles.dashboard}>
      <h1>Practice Dashboard</h1>
      <div className={styles.cardsContainer}>
        <AdminPanelCard 
          title="Manage Appointments" 
          link="/practice-dashboard/appointments" 
        />
        {/* You can add more cards for Analytics, Settings, etc. */}
      </div>
    </div>
  );
}
