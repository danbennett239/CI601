// app/signin/page.tsx

"use client";

import React, { useState } from "react";
import { useDevice } from "@/content/DeviceContent";
import UserLoginForm from "@/components/UserLoginForm/UserLoginForm";
import UserRegisterForm from "@/components/UserRegisterForm/UserRegisterForm";
import styles from "./Signin.module.css";

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
      </div>
    );
  }

  // On desktop, show them side by side
  return (
    <div className={styles.containerDesktop}>
      <div className={styles.loginWrapper}>
        <UserLoginForm onSuccess={handleLoginSuccess} />
      </div>
      <div className={styles.registerWrapper}>
        <UserRegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
}
