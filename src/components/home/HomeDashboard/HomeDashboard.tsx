import { AppointmentCard } from "../AppointmentCard/AppointmentCard";
import { PracticeCard } from "../PracticeCard/PracticeCard";
import { ArticleCard } from "../ArticleCard/ArticleCard";
import styles from "./HomeDashboard.module.css";
import Link from "next/link";

interface HomeDashboardProps {
  appointments: Array<{
    id: string;
    practice: string;
    start_time: string;
    end_time: string;
    services: Record<string, number>;
    image: string;
    address: string;
  }>;
  topPractices: Array<{
    id: string;
    name: string;
    rating: number;
    reviews: number;
    image: string;
  }>;
  articles: Array<{
    id: number;
    title: string;
    image: string;
    excerpt: string;
  }>;
  hasGeoPermission: boolean;
}

export function HomeDashboard({
  appointments,
  topPractices,
  articles,
  hasGeoPermission,
}: HomeDashboardProps) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Book Your Dental Visit Today</h1>
          <p className={styles.subtitle}>Unlock a world of available appointments at your fingertips</p>
          <Link href="/search" className={styles.ctaButton} data-cy="search-appointments-link">
            Search for Appointments
          </Link>
        </div>
      </header>

      <div className={styles.container}>
        <section className={`${styles.section} ${styles.fadeIn}`}>
          <h2 className={styles.sectionTitle}>
            {hasGeoPermission ? "Next Appointments Near You" : "Next Appointments"}
          </h2>
          <div className={styles.cardsGrid}>
            {appointments.length > 0 ? (
              appointments.slice(0, 5).map((appt) => (
                <AppointmentCard key={appt.id} {...appt} />
              ))
            ) : (
              <p>No upcoming appointments available.</p>
            )}
          </div>
        </section>

        <section className={`${styles.section} ${styles.fadeIn}`}>
          <h2 className={styles.sectionTitle}>
            {hasGeoPermission ? "Top Rated Practices Near You" : "Top Rated Practices"}
          </h2>
          <div className={styles.cardsGrid}>
            {topPractices.length > 0 ? (
              topPractices.slice(0, 5).map((practice) => (
                <PracticeCard key={practice.id} {...practice} />
              ))
            ) : (
              <p>No top-rated practices available.</p>
            )}
          </div>
        </section>

        <section className={`${styles.infoSection} ${styles.fadeIn}`}>
          <h2 className={styles.infoTitle}>Why Choose Us?</h2>
          <div className={styles.infoContent}>
            <p>
              Finding and booking your next dental appointment has never been easier. With real-time availability, you can search for appointments near you, filter by services, and book instantly—all in just a few clicks. Our platform ensures you get the care you need, exactly when you need it.</p>
            <p>
              Dental practices trust us to keep their schedules full. By listing unbooked or cancelled appointments, practices can reach more patients and reduce downtime. It&apos;s a win-win: practices thrive, and you get access to more appointment options.</p>
            <p>
              We prioritise trust and transparency. Explore verified practices, read authentic reviews, and check ratings to make informed decisions. Join thousands of satisfied patients who have simplified their dental care with us!</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.fadeIn}`}>
          <h2 className={styles.sectionTitle}>Dental Insights</h2>
          <div className={styles.cardsGrid}>
            {articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}