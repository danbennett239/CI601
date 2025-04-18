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
  location: {
    type: string;
    crs: {
      type: string;
      properties: {
        name: string;
      };
    };
    coordinates: [number, number];
  };
  distance: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface SavedFilters {
  filters: {
    priceRange: [number, number];
    postcode: string;
    maxDistance: number;
    dateRange: [string, string];
    sortOption: string;
    appointmentType: string;
  };
  timestamp: number;
}

export default function SearchPage() {
  const now = new Date();
  const todayISOString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [appointments, setAppointments] = useState<RawAppointment[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{
    priceRange: [number, number];
    postcode: string;
    maxDistance: number;
    dateRange: [string, string];
    sortOption: string;
    appointmentType: string;
  }>(() => {
    const saved = localStorage.getItem('searchFilters');
    if (saved) {
      const { filters, timestamp }: SavedFilters = JSON.parse(saved);
      const expiry = 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp < expiry) {
        return filters;
      }
      localStorage.removeItem('searchFilters');
    }
    return {
      priceRange: [0, 200],
      postcode: '',
      maxDistance: 50,
      dateRange: [todayISOString, ''],
      sortOption: 'soonest',
      appointmentType: '',
    };
  });
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>(appliedFilters.priceRange);
  const [tempPostcode, setTempPostcode] = useState(appliedFilters.postcode);
  const [tempMaxDistance, setTempMaxDistance] = useState(appliedFilters.maxDistance);
  const [tempDateRange, setTempDateRange] = useState<[string, string]>(appliedFilters.dateRange);
  const [tempSortOption, setTempSortOption] = useState(appliedFilters.sortOption);
  const [tempAppointmentType, setTempAppointmentType] = useState<string>(appliedFilters.appointmentType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const LIMIT = 20;

  const fetchAppointments = async (filters: typeof appliedFilters, append: boolean = false) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      ...(filters.appointmentType && { appointmentType: filters.appointmentType }),
      ...(filters.priceRange[0] > 0 && { priceMin: filters.priceRange[0].toString() }),
      ...(filters.priceRange[1] < 200 && { priceMax: filters.priceRange[1].toString() }),
      ...(filters.dateRange[0] && { dateStart: filters.dateRange[0] }),
      ...(filters.dateRange[1] && { dateEnd: filters.dateRange[1] }),
      sortBy: filters.sortOption,
      limit: LIMIT.toString(),
      offset: append ? offset.toString() : '0',
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
        params.set('maxDistance', (filters.maxDistance * 1.60934).toString());
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
      const newAppointments = data.appointments || [];
      if (append) {
        if (newAppointments.length > 0) {
          setAppointments((prev) => [...prev, ...newAppointments]);
          setOffset((prev) => prev + LIMIT);
        }
      } else {
        setAppointments(newAppointments);
        setOffset(LIMIT);
      }
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
    setOffset(0);
    fetchAppointments(newFilters);
    localStorage.setItem('searchFilters', JSON.stringify({ filters: newFilters, timestamp: Date.now() }));
  };

  const showMore = () => {
    fetchAppointments(appliedFilters, true);
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
          {loading && appointments.length === 0 ? (
            <p>Loading appointments...</p>
          ) : error ? (
            <p className={styles.noResults}>{error}</p>
          ) : appointments.length > 0 ? (
            <>
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
                    distance={appt.distance * 0.621371}
                    city={appt.address.city}
                    hasPostcode={!!appliedFilters.postcode}
                    image={appt.photo || '/placeholder.jpg'}
                    appointmentType={appliedFilters.appointmentType}
                  />
                ))}
              </div>
              {appointments.length >= offset && offset < (appointments.length + LIMIT) && (
                <button
                  onClick={showMore}
                  className={styles.showMoreButton}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Show More'}
                </button>
              )}
            </>
          ) : (
            <p className={styles.noResults}>No appointments match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
