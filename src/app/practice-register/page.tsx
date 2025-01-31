"use client";

import React from "react";
import { useDevice } from "@/content/DeviceContent";
import PracticeRegisterForm from "@/components/PracticeRegisterForm/PracticeRegisterForm";
import styles from "./PracticeRegisterPage.module.css";

export default function PracticeRegisterPage() {
  const { isMobile } = useDevice();

  const handleRegisterSuccess = () => {
    console.log("Practice register success!");
    // ...Add your redirect or additional logic here
  };

  return (
    <div className={isMobile ? styles.containerMobile : styles.containerDesktop}>
      <h1>Register Your Dental Practice</h1>
      <PracticeRegisterForm onSuccess={handleRegisterSuccess} />
    </div>
  );
}

