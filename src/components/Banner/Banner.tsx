"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/hooks/useUser"; // adjust the path if necessary
import styles from "./Banner.module.css";

const Banner: React.FC = () => {
  const { user, loading } = useUser();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        // Refresh the page or redirect to the sign-in page after logout
        window.location.href = "/signin";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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

      {/* Navigation Section */}
      <div className={styles.navSection}>
        <Link href="/home">
          <div className={styles.navItem}>Home</div>
        </Link>
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <>
            {/* Additional navigation based on user role */}
            {user.role === "user" && (
              <Link href="/profile">
                <div className={styles.navItem}>Profile Management</div>
              </Link>
            )}
            {user.role === "admin" && (
              <Link href="/admin">
                <div className={styles.navItem}>Admin Panel</div>
              </Link>
            )}
            {(user.role === "practice" ||
              user.role === "unverified-practice") && (
                <Link href="/practice-management">
                  <div className={styles.navItem}>Practice Management</div>
                </Link>
              )}
            <div
              className={styles.navItem}
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              Logout
            </div>
          </>
        ) : (
          <Link href="/signin">
            <div className={styles.navItem}>Sign In</div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Banner;
