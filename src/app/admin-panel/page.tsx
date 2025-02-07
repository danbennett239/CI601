// app/admin-panel/page.tsx
"use client";

import React from "react";
import { useUser } from "@/hooks/useUser";
import AdminPanelCard from "@/components/admin/AdminPanelCard/AdminPanelCard";
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
        <AdminPanelCard
          title="Dental Practice Approvals"
          link="/admin-panel/dental-practices"
        />
        {/* Add more cards as needed */}
      </div>
    </div>
  );
};

export default AdminPanelPage;
