// app/signin/page.tsx

"use client";

import React, { useState } from "react";
import { useDevice } from "@/content/DeviceContent";
import UserLoginForm from "@/components/UserLoginForm/UserLoginForm";
import UserRegisterForm from "@/components/UserRegisterForm/UserRegisterForm";
import styles from "./SignIn.module.css";

export default function SigninPage() {
  const { isMobile } = useDevice();
  // On mobile, we can let the user toggle back and forth
  const [showRegister, setShowRegister] = useState(false);

  // Called after successful login
  const handleLoginSuccess = () => {
    console.log("Login success!");
    // ...Add your redirect or additional logic here
  };

  // Called after successful registration
  const handleRegisterSuccess = () => {
    console.log("Register success!");
    // ...Add your redirect or additional logic here
  };

  if (isMobile) {
    // On mobile, show one form at a time
    return (
      <div className={styles.containerMobile}>
        {showRegister ? (
          <>
            <UserRegisterForm onSuccess={handleRegisterSuccess} />
            <button
              className={styles.toggleButton}
              onClick={() => setShowRegister(false)}
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <UserLoginForm onSuccess={handleLoginSuccess} />
            <button
              className={styles.toggleButton}
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </>
        )}
        <p className={styles.dentalPrompt}>
          Are you a dental practice?{" "}
          <a href="/dental-signin" className={styles.dentalLink}>
            Please go here
          </a>
        </p>
      </div>
    );
  }

  // On desktop, show them side by side with a divider
  return (
    <div className={styles.containerDesktop}>
      <div className={styles.loginWrapper}>
        <UserLoginForm onSuccess={handleLoginSuccess} />
      </div>

      {/* Vertical line divider */}
      <div className={styles.divider} />

      <div className={styles.registerWrapper}>
        <UserRegisterForm onSuccess={handleRegisterSuccess} />
      </div>

      {/* Dental practice link below (or you can place it outside flex, if you prefer) */}
      <div className={styles.dentalPracticeSection}>
        <p className={styles.dentalPrompt}>
          Are you a dental practice?{" "}
          <a href="/dental-signin" className={styles.dentalLink}>
            Please go here
          </a>
        </p>
      </div>
    </div>
  );
}
