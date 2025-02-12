// app/practice-dashboard/page.tsx
"use client";

import React from "react";
import { useUser } from "@/hooks/useUser";
import AdminPanelCard from "@/components/admin/AdminPanelCard/AdminPanelCard";
import styles from "./PracticeDashboardPage.module.css";

export default function PracticeDashboard() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "verified-practice") {
    return <div>Access Denied: You are not authorized to view this page.</div>;
  }

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
