// app/admin-panel/page.tsx
"use client";

import React from "react";
import { useUser } from "@/hooks/useUser";
import PanelCard from "@/components/PanelCard/PanelCard";
import styles from "./AdminPanelPage.module.css";

const AdminPanelPage = () => {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "admin") {
    return <div>Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Admin Panel</h1>
      <div className={styles.cardsContainer}>
        {/* Each card represents an admin function */}
        <PanelCard
          title="Dental Practice Applications"
          link="/admin-panel/dental-practices"
        />
        {/* Add more cards as needed */}
      </div>
    </div>
  );
};

export default AdminPanelPage;
