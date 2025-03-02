"use client";

import React from "react";
import styles from "./PracticeRegisterPage.module.css";
import PracticeRegisterForm from "@/components/PracticeRegisterForm/PracticeRegisterForm";

export default function PracticeRegisterPage() {
  const handleSuccess = () => {
    console.log("Practice registered successfully!");
    // Possibly redirect or show success message
  };

  return (
    <div className={styles.practiceRegisterFormContainer}>
      <PracticeRegisterForm onSuccess={handleSuccess} />
    </div>
  );
}
