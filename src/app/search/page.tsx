'use client';

import { useState } from 'react';
import SearchFilters from '@/components/search/SearchFilters/SearchFilters';
import AppointmentCard from '@/components/search/AppointmentCard/AppointmentCard';
import styles from './SearchPage.module.css';

interface Appointment {
  id: number;
  practice: string;
  time: string;
  type: string;
  price: number;
  distance: number;
  image: string;
}

export default function SearchPage() {
  const initialAppointments: Appointment[] = [
    { id: 1, practice: "Smile Dental", time: "2025-02-25 10:00", type: "Cleaning", price: 80, distance: 2.5, image: "/dummy1.jpg" },
    { id: 2, practice: "Bright Teeth", time: "2025-02-25 14:30", type: "Check-up", price: 60, distance: 5.0, image: "/dummy2.jpg" },
    { id: 3, practice: "Perfect Smile", time: "2025-02-26 11:15", type: "Filling", price: 120, distance: 1.8, image: "/dummy3.jpg" },
    { id: 4, practice: "Glow Dental", time: "2025-02-27 09:30", type: "Whitening", price: 150, distance: 3.2, image: "/dummy4.jpg" },
    { id: 5, practice: "Healthy Smiles", time: "2025-02-27 15:00", type: "Check-up", price: 70, distance: 4.5, image: "/dummy5.jpg" },
    { id: 6, practice: "Perfect Smile", time: "2025-03-01 15:15", type: "Braces Consultation", price: 120, distance: 2.2, image: "/dummy1.jpg" },
    { id: 7, practice: "Bright Teeth", time: "2025-03-02 08:45", type: "Cleaning", price: 50, distance: 3.0, image: "/dummy2.jpg" },
    { id: 8, practice: "Glow Dental", time: "2025-03-10 13:30", type: "Braces Consultation", price: 80, distance: 4.1, image: "/dummy5.jpg" },
    { id: 9, practice: "Pure Dental", time: "2025-03-10 14:00", type: "Root Canal", price: 60, distance: 1.0, image: "/dummy3.jpg" },
    { id: 10, practice: "Bright Teeth", time: "2025-03-12 17:00", type: "Gum Treatment", price: 100, distance: 4.5, image: "/dummy2.jpg" },
    { id: 11, practice: "Healthy Smiles", time: "2025-03-08 08:45", type: "Gum Treatment", price: 50, distance: 1.0, image: "/dummy4.jpg" },
    { id: 12, practice: "Healthy Smiles", time: "2025-03-06 11:45", type: "Root Canal", price: 70, distance: 2.5, image: "/dummy3.jpg" },
    { id: 13, practice: "Bright Teeth", time: "2025-03-09 17:30", type: "Check-up", price: 50, distance: 5.0, image: "/dummy1.jpg" },
    { id: 14, practice: "Smile Dental", time: "2025-03-14 08:45", type: "Check-up", price: 70, distance: 7.8, image: "/dummy3.jpg" },
    { id: 15, practice: "Smile Dental", time: "2025-03-06 12:00", type: "Cleaning", price: 60, distance: 5.0, image: "/dummy3.jpg" },
    { id: 16, practice: "Perfect Smile", time: "2025-03-02 13:15", type: "Root Canal", price: 90, distance: 6.2, image: "/dummy4.jpg" },
    { id: 17, practice: "Pure Dental", time: "2025-03-04 13:00", type: "Root Canal", price: 50, distance: 4.5, image: "/dummy3.jpg" },
    { id: 18, practice: "White Pearl Clinic", time: "2025-03-04 10:15", type: "Root Canal", price: 100, distance: 2.2, image: "/dummy5.jpg" },
    { id: 19, practice: "Dazzling Dental", time: "2025-03-10 15:00", type: "Gum Treatment", price: 60, distance: 4.5, image: "/dummy2.jpg" },
    { id: 20, practice: "White Pearl Clinic", time: "2025-03-02 11:45", type: "Whitening", price: 60, distance: 5.0, image: "/dummy5.jpg" },
    { id: 21, practice: "Bright Teeth", time: "2025-03-12 16:30", type: "Filling", price: 100, distance: 3.0, image: "/dummy3.jpg" },
    { id: 22, practice: "Glow Dental", time: "2025-03-01 14:30", type: "Braces Consultation", price: 50, distance: 7.8, image: "/dummy1.jpg" },
    { id: 23, practice: "Dazzling Dental", time: "2025-03-03 12:30", type: "Filling", price: 100, distance: 6.2, image: "/dummy3.jpg" },
    { id: 24, practice: "Smile Dental", time: "2025-03-08 12:30", type: "Check-up", price: 100, distance: 2.5, image: "/dummy3.jpg" },
    { id: 25, practice: "Pure Dental", time: "2025-03-09 12:15", type: "Check-up", price: 50, distance: 7.8, image: "/dummy4.jpg" },
    { id: 26, practice: "Smile Dental", time: "2025-03-07 13:00", type: "Cleaning", price: 80, distance: 4.5, image: "/dummy1.jpg" },
    { id: 27, practice: "Healthy Smiles", time: "2025-03-09 11:15", type: "Braces Consultation", price: 50, distance: 4.1, image: "/dummy5.jpg" },
    { id: 28, practice: "Healthy Smiles", time: "2025-02-28 08:45", type: "Whitening", price: 150, distance: 6.2, image: "/dummy2.jpg" },
    { id: 29, practice: "Pure Dental", time: "2025-03-14 15:45", type: "Gum Treatment", price: 120, distance: 4.5, image: "/dummy4.jpg" },
    { id: 30, practice: "Smile Dental", time: "2025-03-06 11:00", type: "Braces Consultation", price: 90, distance: 7.8, image: "/dummy1.jpg" }
  ];

  const [appointments, setAppointments] = useState(initialAppointments);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [postcode, setPostcode] = useState('');
  const [maxDistance, setMaxDistance] = useState(50);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [sortOption, setSortOption] = useState('default');

  const handleFilter = () => {
    let filtered = [...initialAppointments];

    // Price filter
    filtered = filtered.filter(
      (appt) => appt.price >= priceRange[0] && appt.price <= priceRange[1]
    );

    // Postcode + Distance filter (placeholder logic)
    if (postcode) {
      filtered = filtered.filter((appt) => appt.distance <= maxDistance);
    }

    // Date filter (placeholder logic - assumes ISO strings)
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(
        (appt) =>
          new Date(appt.time) >= new Date(dateRange[0]) &&
          new Date(appt.time) <= new Date(dateRange[1])
      );
    }

    // Sorting
    switch (sortOption) {
      case 'lowest-price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'highest-price':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'closest':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'soonest':
        filtered.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        break;
      default:
        break;
    }

    setAppointments(filtered);
  };

  return (
    <div className={styles.searchPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Find Your Appointment</h1>
        <p className={styles.subtitle}>Filter and book available dental slots</p>
      </header>

      <div className={styles.content}>
        <SearchFilters
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          postcode={postcode}
          setPostcode={setPostcode}
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          dateRange={dateRange}
          setDateRange={setDateRange}
          sortOption={sortOption}
          setSortOption={setSortOption}
          onFilter={handleFilter}
          appointments={appointments}
        />
        <div className={styles.results}>
          {appointments.length > 0 ? (
            <div className={styles.cardsGrid}>
              {appointments.map((appt) => (
                <AppointmentCard key={appt.id} {...appt} />
              ))}
            </div>
          ) : (
            <p className={styles.noResults}>No appointments match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}