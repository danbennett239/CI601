// components/admin/DentalPracticeBox.tsx
"use client";

import React, { useState } from 'react';
import DentalPracticeApplications from '../DentalPracticeApplications/DentalPracticeApplications';
import ApprovedDentalPractices from '../ApprovedDentalPractices/ApprovedDentalPractices';
import styles from './DentalPracticeBox.module.css';

type Tab = 'applications' | 'approved';

const DentalPracticeBox = () => {
  const [activeTab, setActiveTab] = useState<Tab>('applications');

  return (
    <div className={styles.box}>
      <h2>Dental Practice Applications</h2>
      <div className={styles.tabs}>
        <button
          className={activeTab === 'applications' ? styles.activeTab : ''}
          onClick={() => setActiveTab('applications')}
        >
          Pending Applications
        </button>
        <button
          className={activeTab === 'approved' ? styles.activeTab : ''}
          onClick={() => setActiveTab('approved')}
        >
          Approved Practices
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'applications' ? (
          <DentalPracticeApplications />
        ) : (
          <ApprovedDentalPractices />
        )}
      </div>
    </div>
  );
};

export default DentalPracticeBox;
