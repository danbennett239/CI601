'use client';

import { useState, useEffect } from 'react';
import SearchFilters from '@/components/search/SearchFilters/SearchFilters';
import AppointmentCard from '@/components/search/AppointmentCard/AppointmentCard';
import styles from './SearchPage.module.css';

interface RawAppointment {
  appointment_id: string;
  practice_id: string;
  user_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  booked: boolean;
  created_at: string;
  updated_at: string;
  services: Record<string, number>;
  booked_service: Record<string, any> | null;
  practice_name: string;
  email: string;
  phone_number: string;
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
  verified: boolean;
  verified_at: string | null;
  location: any;
  distance: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function SearchPage() {
  const [appointments, setAppointments] = useState<RawAppointment[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{
    priceRange: [number, number];
    postcode: string;
    maxDistance: number;
    dateRange: [string, string];
    sortOption: string;
    appointmentType: string;
  }>({
    priceRange: [0, 200],
    postcode: '',
    maxDistance: 50,
    dateRange: ['', ''],
    sortOption: 'soonest',
    appointmentType: '',
  });
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 200]);
  const [tempPostcode, setTempPostcode] = useState('');
  const [tempMaxDistance, setTempMaxDistance] = useState(50);
  const [tempDateRange, setTempDateRange] = useState<[string, string]>(['', '']);
  const [tempSortOption, setTempSortOption] = useState('soonest');
  const [tempAppointmentType, setTempAppointmentType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async (filters: typeof appliedFilters) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      ...(filters.appointmentType && { appointmentType: filters.appointmentType }),
      ...(filters.priceRange[0] > 0 && { priceMin: filters.priceRange[0].toString() }),
      ...(filters.priceRange[1] < 200 && { priceMax: filters.priceRange[1].toString() }),
      ...(filters.dateRange[0] && { dateStart: filters.dateRange[0] }),
      ...(filters.dateRange[1] && { dateEnd: filters.dateRange[1] }),
      sortBy: filters.sortOption,
      limit: '10',
    });

    if (filters.postcode) {
      try {
        const response = await fetch(`/api/location/geocode?postcode=${encodeURIComponent(filters.postcode)}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Geocode failed with status: ${response.status}`);
        }
        const coords: Coordinates = data;
        params.set('lat', coords.latitude.toString());
        params.set('lon', coords.longitude.toString());
        params.set('maxDistance', (filters.maxDistance * 1.60934).toString()); // Miles to km, always include if postcode
      } catch (err: unknown) {
        console.error('Geocode error details:', err);
        setError(err instanceof Error ? err.message : 'Failed to geocode postcode');
        setLoading(false);
        setAppointments([]);
        return;
      }
    }

    try {
      const response = await fetch(`/api/appointment/search?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Search failed with status: ${response.status}`);
      setAppointments(data.appointments || []);
    } catch (err: unknown) {
      console.error('Fetch appointments error:', err);
      const message = err instanceof Error ? err.message : 'Error fetching appointments';
      setError(message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(appliedFilters);
  }, []);

  const applyFilters = () => {
    const newFilters = {
      priceRange: tempPriceRange,
      postcode: tempPostcode,
      maxDistance: tempMaxDistance,
      dateRange: tempDateRange,
      sortOption: tempSortOption,
      appointmentType: tempAppointmentType,
    };
    setAppliedFilters(newFilters);
    fetchAppointments(newFilters);
  };

  return (
    <div className={styles.searchPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Find Your Appointment</h1>
        <p className={styles.subtitle}>View and book available dental slots</p>
      </header>

      <div className={styles.content}>
        <SearchFilters
          priceRange={tempPriceRange}
          setPriceRange={setTempPriceRange}
          postcode={tempPostcode}
          setPostcode={setTempPostcode}
          maxDistance={tempMaxDistance}
          setMaxDistance={setTempMaxDistance}
          dateRange={tempDateRange}
          setDateRange={setTempDateRange}
          sortOption={tempSortOption}
          setSortOption={setTempSortOption}
          appointmentType={tempAppointmentType}
          setAppointmentType={setTempAppointmentType}
          onFilter={applyFilters}
          appointments={appointments.map((appt) => ({
            price: appliedFilters.appointmentType && appt.services[appliedFilters.appointmentType]
              ? appt.services[appliedFilters.appointmentType]
              : Object.values(appt.services)[0] || 0,
          }))}
        />
        <div className={styles.results}>
          {loading ? (
            <p>Loading appointments...</p>
          ) : error ? (
            <p className={styles.noResults}>{error}</p>
          ) : appointments.length > 0 ? (
            <div className={styles.cardsGrid}>
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt.appointment_id}
                  id={appt.appointment_id}
                  practice={appt.practice_name}
                  time={appt.start_time}
                  type={appliedFilters.appointmentType || Object.keys(appt.services)[0] || 'Unknown'}
                  price={
                    appliedFilters.appointmentType && appt.services[appliedFilters.appointmentType]
                      ? appt.services[appliedFilters.appointmentType]
                      : Object.values(appt.services)[0] || 0
                  }
                  distance={appt.distance}
                  city={appt.address.city}
                  hasPostcode={!!appliedFilters.postcode}
                  image={appt.photo || '/placeholder.jpg'}
                />
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