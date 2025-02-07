// app/admin-panel/page.tsx
"use client";

import React from 'react';
import { useUser } from '@/hooks/useUser';
import DentalPracticeBox from '@/components/admin/DentalPracticeBox/DentalPracticeBox';
import styles from './AdminPanelPage.module.css';

const AdminPanelPage = () => {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <div>Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Admin Panel</h1>
      <div className={styles.boxesContainer}>
        {/* This box will eventually lead to dental practice management */}
        <DentalPracticeBox />
        {/* Additional admin boxes/components can be added here */}
      </div>
    </div>
  );
};

export default AdminPanelPage;
