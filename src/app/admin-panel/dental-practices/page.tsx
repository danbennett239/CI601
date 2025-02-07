"use client";

import React from "react";
import Link from "next/link";
import DentalPracticeBox from "@/components/admin/DentalPracticeBox/DentalPracticeBox";
import styles from "./DentalPracticesPage.module.css";

const DentalPracticesPage = () => {
  return (
    <div className={styles.container}>
      <Link href="/admin-panel" className={styles.backButton}>
        Back to Admin Panel
      </Link>
      <h1>Dental Practice Applications</h1>
      <DentalPracticeBox />
    </div>
  );
};

export default DentalPracticesPage;
