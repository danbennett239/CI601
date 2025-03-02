'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styles from './ErrorPage.module.css';
import Image from 'next/image';

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'Unknown';

  const handleBackToSearch = () => {
    router.push('/search');
  };

  return (
    <div className={styles.errorPage}>
      <h1 className={styles.title}>Sorry, Something Went Wrong</h1>
      <Image
        src="/error-tooth.png"
        alt="Sad tooth indicating an error"
        width={150}
        height={150}
        className={styles.errorImage}
      />
      <p className={styles.message}>
        This appointment is no longer available (Error {status}). Please return to the search to find another appointment.
      </p>
      <button onClick={handleBackToSearch} className={styles.backButton}>
        Back to Search
      </button>
    </div>
  );
}