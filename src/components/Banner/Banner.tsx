"use client";

import React from "react";
import styles from "./Banner.module.css";

const Banner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <div className={styles.logoSection}>
        <img
          src="/logo.png" // Replace with the actual path to your logo
          alt="Tempname Logo"
          className={styles.logo}
        />
        <span className={styles.name}>Tempname</span>
      </div>
    </div>
  );
};

export default Banner;
