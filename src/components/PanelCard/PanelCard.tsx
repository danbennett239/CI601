"use client";

import React from "react";
import Link from "next/link";
import styles from "./PanelCard.module.css";

interface PanelCardProps {
  title: string;
  link: string;
}

const PanelCard: React.FC<PanelCardProps> = ({ title, link }) => {
  return (
    <Link href={link} className={styles.card}>
      <div className={styles.cardContent}>
        <h2>{title}</h2>
      </div>
    </Link>
  );
};

export default PanelCard;
