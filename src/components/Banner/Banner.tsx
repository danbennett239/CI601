"use client";

import React from "react";
import Link from "next/link";
import Image from 'next/image'
import styles from "./Banner.module.css";

const Banner: React.FC = () => {
  return (
    <div className={styles.banner}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <Image
          src="/logo.png"
          alt="Tempname Logo"
          className={styles.logo}
          height={40}
          width={40}
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
