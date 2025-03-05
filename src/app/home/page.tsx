import { HomeDashboard } from "@/components/home/HomeDashboard/HomeDashboard";
import { PracticeWithReviews } from "@/types/practice";

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

async function fetchInitialData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Fetch appointments
  const apptResponse = await fetch(`${baseUrl}/api/appointment/home?limit=5`, {
    cache: "no-store", // Ensure fresh data
  });
  const apptData = await apptResponse.json();
  const appointments: ProcessedAppointment[] = apptData.appointments.map((appt: RawAppointment) => ({
    id: appt.appointment_id,
    practice: appt.practice.practice_name,
    start_time: appt.start_time,
    end_time: appt.end_time,
    services: appt.services,
    image: appt.practice.photo || "/default-practice.jpg",
    address: `${appt.practice.address.line1}, ${appt.practice.address.city}, ${appt.practice.address.postcode}`,
  }));

  // Fetch top practices
  const pracResponse = await fetch(`${baseUrl}/api/practice/home?limit=5`, {
    cache: "no-store",
  });
  const pracData = await pracResponse.json();
  const topPractices: ProcessedPractice[] = pracData.practices.map((p: PracticeWithReviews) => ({
    id: p.practice_id,
    name: p.practice_name,
    rating: p.practice_reviews_aggregate?.aggregate?.avg?.rating || 0,
    reviews: p.practice_reviews_aggregate?.aggregate?.count || 0,
    image: p.photo || "/default-practice.jpg",
  }));

  return { appointments, topPractices };
}

export default async function Home() {
  const { appointments, topPractices } = await fetchInitialData();

  const articlesData: Article[] = [
    { id: 1, title: "Top 5 Dental Hygiene Tips", image: "/dummy2.jpg", excerpt: "Learn the essentials of perfect oral health." },
    { id: 2, title: "Why Regular Checkups Matter", image: "/dummy3.jpg", excerpt: "Prevention is better than cure." },
    { id: 3, title: "Best Foods for Teeth", image: "/dummy4.jpg", excerpt: "Eat your way to a brighter smile." },
    { id: 4, title: "Understanding Cavities", image: "/dummy5.jpg", excerpt: "What you need to know." },
  ];

  return (
    <HomeDashboard
      appointments={appointments}
      topPractices={topPractices}
      articles={articlesData}
      hasGeoPermission={false} // Default to false server-side
    />
  );
}