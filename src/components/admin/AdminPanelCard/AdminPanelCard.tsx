"use client";

import React from "react";
import Link from "next/link";
import styles from "./AdminPanelCard.module.css";

interface AdminPanelCardProps {
  title: string;
  link: string;
}

const AdminPanelCard: React.FC<AdminPanelCardProps> = ({ title, link }) => {
  return (
    <Link href={link} className={styles.card}>
      <div className={styles.cardContent}>
        <h2>{title}</h2>
      </div>
    </Link>
  );
};

export default AdminPanelCard;
