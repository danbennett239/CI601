// components/admin/ApprovedDentalPractices/ApprovedDentalPractices.tsx
"use client";

import React, { useState, useEffect } from "react";
import DentalPracticeModal from "../DentalPracticeModal/DentalPracticeModal";
import styles from "./ApprovedDentalPractices.module.css";
import { Practice } from "@/types/practice";

const ApprovedDentalPractices = () => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPractices = async () => {
    try {
      const response = await fetch("/api/practice/approved");
      if (!response.ok) throw new Error("Failed to fetch approved practices.");
      const data = await response.json();
      setPractices(data);
    } catch (error) {
      console.error("Error fetching approved practices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPractices();
  }, []);

  const handlePracticeClick = (practice: Practice) => {
    setSelectedPractice(practice);
  };

  const closeModal = () => {
    setSelectedPractice(null);
    loadPractices();
  };

  if (loading) return <div>Loading...</div>;
  if (practices.length === 0)
    return <div>No approved dental practices found.</div>;

  return (
    <div className={styles.list}>
      {practices.map((practice) => (
        <div
          key={practice.practice_id}
          className={styles.listItem}
          onClick={() => handlePracticeClick(practice)}
        >
          <h3>{practice.practice_name}</h3>
          <p>{practice.email}</p>
        </div>
      ))}
      {selectedPractice && (
        <DentalPracticeModal
          practice={selectedPractice}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ApprovedDentalPractices;
