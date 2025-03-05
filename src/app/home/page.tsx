"use client";

import React, { useState, useEffect } from "react";
import { HomeDashboard } from "@/components/home/HomeDashboard/HomeDashboard";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { Practice} from "@/types/practice";

// New type for Practice including review aggregation
export interface PracticeWithReviews extends Practice {
  practice_reviews_aggregate: {
    aggregate: {
      avg: {
        rating: number | null;
      };
      count: number;
    };
  };
}
export interface RawAppointment {
  appointment_id: string;
  practice_id: string;
  title: string;
  start_time: string;
  end_time: string;
  services: Record<string, number>;
  practice: {
    practice_name: string;
    photo: string | null;
  };
}

export interface ProcessedAppointment {
  id: string;
  practice: string;
  time: string;
  type: string;
  price: number;
  image: string;
}

export interface ProcessedPractice {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
}

export interface Article {
  id: number;
  title: string;
  image: string;
  excerpt: string;
}

export default function Home() {
  const { loading, error, latitude, longitude } = useGeoLocation();

  const [appointments, setAppointments] = useState<ProcessedAppointment[]>([]);
  const [topPractices, setTopPractices] = useState<ProcessedPractice[]>([]);
  const [hasGeoPermission, setHasGeoPermission] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const articlesData: Article[] = [
    { id: 1, title: "Top 5 Dental Hygiene Tips", image: "/dummy2.jpg", excerpt: "Learn the essentials of perfect oral health." },
    { id: 2, title: "Why Regular Checkups Matter", image: "/dummy3.jpg", excerpt: "Prevention is better than cure." },
    { id: 3, title: "Best Foods for Teeth", image: "/dummy4.jpg", excerpt: "Eat your way to a brighter smile." },
    { id: 4, title: "Understanding Cavities", image: "/dummy5.jpg", excerpt: "What you need to know." },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch next appointments
        const apptResponse = await fetch("/api/appointment/home?limit=5");
        const apptData = await apptResponse.json();
        if (apptData.appointments) {
          const processedAppointments: ProcessedAppointment[] = apptData.appointments.map((appt: RawAppointment) => ({
            id: appt.appointment_id,
            practice: appt.practice.practice_name,
            time: appt.start_time,
            type: Object.keys(appt.services)[0] || "Appointment",
            price: Object.values(appt.services)[0] || 0,
            image: appt.practice.photo || "/default-practice.jpg",
          }));
          setAppointments(processedAppointments);
        }

        // Fetch top practices
        const pracResponse = await fetch("/api/practice/home?limit=5");
        const pracData = await pracResponse.json();
        if (pracData.practices) {
          const processedPractices: ProcessedPractice[] = pracData.practices.map((p: PracticeWithReviews) => ({
            id: p.practice_id,
            name: p.practice_name,
            rating: p.practice_reviews_aggregate?.aggregate?.avg?.rating || 0,
            reviews: p.practice_reviews_aggregate?.aggregate?.count || 0,
            image: p.photo || "/default-practice.jpg",
          }));
          setTopPractices(processedPractices);
        }
      } catch (error) {
        console.error("Error fetching initial home data:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    setHasGeoPermission(!loading && !error && latitude !== null && longitude !== null);
  }, [loading, error, latitude, longitude]);

  if (isDataLoading) return <div>Loading...</div>;

  return (
    <>
      {loading && <div>Loading location...</div>}
      {error && <div>Error: {error}</div>}
      {latitude && longitude && (
        <div>Your Location: Lat {latitude}, Lon {longitude}</div>
      )}
      <HomeDashboard
        appointments={appointments}
        topPractices={topPractices}
        articles={articlesData}
        hasGeoPermission={hasGeoPermission}
      />
    </>
  );
}
