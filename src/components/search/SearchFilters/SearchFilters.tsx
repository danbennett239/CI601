'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './SearchFilters.module.css';

interface SearchFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  postcode: string;
  setPostcode: (postcode: string) => void;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  dateRange: [string, string];
  setDateRange: (range: [string, string]) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  appointmentType: string;
  setAppointmentType: (type: string) => void;
  onFilter: () => void;
  appointments: { price: number }[];
}

export default function SearchFilters({
  priceRange,
  setPriceRange,
  postcode,
  setPostcode,
  maxDistance,
  setMaxDistance,
  dateRange,
  setDateRange,
  sortOption,
  setSortOption,
  appointmentType,
  setAppointmentType,
  onFilter,
  appointments,
}: SearchFiltersProps) {
  const [minPrice, setMinPrice] = useState(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(priceRange[1]);
  const [distance, setDistance] = useState(maxDistance);
  const sliderRef = useRef<HTMLDivElement>(null);

  const appointmentTypes = ['checkup', 'filling', 'cleaning', 'emergency', 'whitening', 'extraction'];

  // Static range for slider and histogram, not tied to API response
  const priceMin = 0;
  const priceMax = 200;
  const bins = 10;
  const binSize = (priceMax - priceMin) / bins;
  const histogram = Array(bins).fill(0);
  appointments.forEach((appt) => {
    if (appt.price >= priceMin && appt.price <= priceMax) {
      const binIndex = Math.min(Math.floor((appt.price - priceMin) / binSize), bins - 1);
      histogram[binIndex]++;
    }
  });

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    setMaxDistance(distance);
  }, [minPrice, maxPrice, distance, setPriceRange, setMaxDistance]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, isMin: boolean) => {
    const value = Number(e.target.value);
    if (isMin) {
      setMinPrice(value <= maxPrice ? value : maxPrice);
    } else {
      setMaxPrice(value >= minPrice ? value : minPrice);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, isMin: boolean) => {
    const value = Number(e.target.value);
    if (isMin) {
      setMinPrice(value <= maxPrice ? value : maxPrice);
    } else {
      setMaxPrice(value >= minPrice ? value : minPrice);
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 200]);
    setMinPrice(0);
    setMaxPrice(200);
    setPostcode('');
    setMaxDistance(50);
    setDistance(50);
    setDateRange(['', '']);
    setSortOption('soonest');
    setAppointmentType('');
    onFilter();
  };

  return (
    <div className={styles.filters}>
      <h3 className={styles.filterTitle}>Filter Appointments</h3>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Sort By</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="soonest">Soonest</option>
          <option value="lowest_price">Lowest Price</option>
          <option value="highest_price">Highest Price</option>
          <option value="closest">Closest</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Appointment Type</label>
        <select
          value={appointmentType}
          onChange={(e) => setAppointmentType(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="">Any Type</option>
          {appointmentTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Price Range (£)</label>
        <div className={styles.histogramSlider}>
          <div className={styles.histogram}>
            {histogram.map((count, index) => (
              <div
                key={index}
                className={styles.histogramBar}
                style={{ height: `${count * 5}px` }}
              />
            ))}
          </div>
          <div className={styles.sliderContainer} ref={sliderRef}>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={minPrice}
              onChange={(e) => handleSliderChange(e, true)}
              className={`${styles.priceSlider} ${styles.minSlider}`}
            />
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={maxPrice}
              onChange={(e) => handleSliderChange(e, false)}
              className={`${styles.priceSlider} ${styles.maxSlider}`}
            />
            <div
              className={styles.sliderTrack}
              style={{
                left: `${((minPrice - priceMin) / (priceMax - priceMin)) * 100}%`,
                width: `${((maxPrice - minPrice) / (priceMax - priceMin)) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className={styles.priceInputs}>
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>Min</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handlePriceChange(e, true)}
              min={priceMin}
              max={maxPrice}
              className={styles.priceInput}
            />
          </div>
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>Max</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handlePriceChange(e, false)}
              min={minPrice}
              max={priceMax}
              className={styles.priceInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Location (Postcode)</label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="e.g., SO31 7GT"
          className={styles.postcodeInput}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Max Distance (miles)</label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          min={0}
          className={styles.distanceInput}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Date Range</label>
        <div className={styles.dateInputs}>
          <input
            type="datetime-local"
            value={dateRange[0]}
            onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
            className={styles.dateInput}
          />
          <span>to</span>
          <input
            type="datetime-local"
            value={dateRange[1]}
            onChange={(e) => setDateRange([dateRange[0], e.target.value])}
            className={styles.dateInput}
          />
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={onFilter} className={styles.filterButton}>
          Apply Filters
        </button>
        <button onClick={clearFilters} className={styles.clearButton}>
          Clear Filters
        </button>
      </div>
    </div>
  );
}