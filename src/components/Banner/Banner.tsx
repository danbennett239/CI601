"use client";

import React from "react";
import Link from "next/link";
import styles from "./Banner.module.css";

const Banner: React.FC = () => {
  return (
    <div className={styles.banner}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <img
          src="/logo.png" // Replace with the actual path to your logo
          alt="Tempname Logo"
          className={styles.logo}
        />
        <span className={styles.name}>Tempname</span>
      </div>

      {/* Sign In Section */}
      <Link href="/signin">
        <div className={styles.signInSection}>
          Sign In
        </div>
      </Link>
    </div>
  );
};

export default Banner;
