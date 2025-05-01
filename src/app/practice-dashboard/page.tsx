// app/practice-dashboard/page.tsx
"use client";

import React from "react";
import { useUser } from "@/hooks/useUser";
import { usePractice } from "@/hooks/usePractice";
import PanelCard from "@/components/PanelCard/PanelCard";
import styles from "./PracticeDashboardPage.module.css";

export default function PracticeDashboard() {
  const { user, loading } = useUser();
  const { practice, loading: practiceLoading, error } = usePractice(user?.practice_id);
  console.log(practice, practiceLoading, error);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "verified-practice") {
    return <div>Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1>Practice Dashboard</h1>
      <div className={styles.cardsContainer}>
        <PanelCard
          title="Manage Appointments"
          link="/practice-dashboard/appointments"
          data-cy="manage-appointments-link"
        />
        <PanelCard
          title="Manage Practice Information and Preferences"
          link="/practice-dashboard/settings"
          data-cy="manage-practice-settings-link"
        />
        <PanelCard
          title="Analytics Dashboard"
          link="/practice-dashboard/analytics"
        />
        <PanelCard
          title="Add an Additional Practice User"
          link="/practice-dashboard/additional-user"
        />
      </div>
    </div>
  );
}
