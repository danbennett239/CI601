"use client";

import React from "react";
import PracticeRegisterForm from "@/components/PracticeRegisterForm/PracticeRegisterForm";

export default function PracticeRegisterPage() {
  const handleSuccess = () => {
    console.log("Practice registered successfully!");
    // Possibly redirect or show success message
  };

  return (
    <div style={{ marginTop: "50px" }}>
      <PracticeRegisterForm onSuccess={handleSuccess} />
    </div>
  );
}
