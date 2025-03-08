"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import styles from "./Banner.module.css";

const Banner: React.FC = () => {
  const { user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        window.location.href = "/signin";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bannerRef.current && !bannerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const navItems = (
    <>
      <Link href="/home" onClick={closeMenu}>
        <div className={styles.navItem}>Home</div>
      </Link>
      {(!user || !["admin", "unverified-practice", "verified-practice"].includes(user.role)) && (
        <Link href="/search" onClick={closeMenu}>
          <div className={styles.navItem}>Book Appointment</div>
        </Link>
      )}
      {loading ? (
        <Link href="/signin" onClick={closeMenu}>
          <div className={styles.navItem}>Sign In</div>
        </Link>
      ) : user ? (
        <>
          {user.role === "user" && (
            <>
              <Link href="/my-appointments" onClick={closeMenu}>
                <div className={styles.navItem}>My Appointments</div>
              </Link>
              <Link href="/profile" onClick={closeMenu}>
                <div className={styles.navItem}>Profile Management</div>
              </Link>
            </>
          )}
          {user.role === "admin" && (
            <Link href="/admin-panel" onClick={closeMenu}>
              <div className={styles.navItem}>Admin Panel</div>
            </Link>
          )}
          {user.role === "unverified-practice" && (
            <Link href="/practice-application" onClick={closeMenu}>
              <div className={styles.navItem}>View Application</div>
            </Link>
          )}
          {user.role === "verified-practice" && (
            <Link href="/practice-dashboard" onClick={closeMenu}>
              <div className={styles.navItem}>Practice Dashboard</div>
            </Link>
          )}
          <div
            className={styles.navItem}
            onClick={() => {
              handleLogout();
              closeMenu();
            }}
            style={{ cursor: "pointer" }}
          >
            Logout
          </div>
        </>
      ) : (
        <Link href="/signin" onClick={closeMenu}>
          <div className={styles.navItem}>Sign In</div>
        </Link>
      )}
    </>
  );

  return (
    <div className={`${styles.banner} ${menuOpen ? styles.menuOpen : ''}`} ref={bannerRef}>
      <div className={styles.bannerContent}>
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

        {/* Desktop Navigation */}
        <div className={styles.navSection}>
          {navItems}
        </div>

        {/* Hamburger Menu Button */}
        <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
          <span className={styles.hamburgerIcon}></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ''}`}>
        {navItems}
      </div>
    </div>
  );
};

export default Banner;