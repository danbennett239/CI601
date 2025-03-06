"use client";

import { useState, useEffect } from "react";
import { HomeDashboard } from "../HomeDashboard/HomeDashboard";
import { useGeoLocation } from "@/hooks/useGeoLocation";

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
    address: {
      line1: string;
      line2: string | null;
      line3: string | null;
      city: string;
      county: string | null;
      postcode: string;
      country: string;
    };
    distance: number;
  };
}

export interface ProcessedAppointment {
  id: string;
  practice: string;
  start_time: string;
  end_time: string;
  services: Record<string, number>;
  image: string;
  address: string;
  distance: number;
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

interface HomeWithGeoProps {
  initialAppointments: ProcessedAppointment[];
  initialTopPractices: ProcessedPractice[];
  articles: Article[];
}

export function HomeWithGeo({ initialAppointments, initialTopPractices, articles }: HomeWithGeoProps) {
  const { loading, error, latitude, longitude } = useGeoLocation();
  const [appointments, setAppointments] = useState(initialAppointments);

  useEffect(() => {
    if (!loading && !error && latitude && longitude) {
      const fetchGeoData = async () => {
        try {
          const response = await fetch(
            `/api/appointment/home?limit=5&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.appointments) {
            const updatedAppointments = data.appointments.map((appt: any) => ({
              id: appt.appointment_id,
              practice: appt.practice.practice_name,
              start_time: appt.start_time,
              end_time: appt.end_time,
              services: appt.services,
              image: appt.practice.photo || "/default-practice.jpg",
              address: `${appt.practice.address.line1}, ${appt.practice.address.city}, ${appt.practice.address.postcode}`,
              distance: appt.practice.distance,
            }));
            setAppointments(updatedAppointments);
          }
        } catch (err) {
          console.error("Error fetching geo appointments:", err);
        }
      };
      fetchGeoData();
    }
  }, [loading, error, latitude, longitude]);

  return (
    <>
      {latitude && longitude && (
        <div>Your Location: Lat {latitude}, Lon {longitude}</div>
      )}
      <HomeDashboard
        appointments={appointments}
        topPractices={initialTopPractices}
        articles={articles}
        hasGeoPermission={!loading && !error && !!latitude && !!longitude}
      />
    </>
  );
}