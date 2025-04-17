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
  /* 👇  keep the raw input as a string */
  const [minPrice, setMinPrice] = useState<string>(priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState<string>(priceRange[1].toString());
  const [distance, setDistance] = useState<number>(maxDistance);
  const sliderRef = useRef<HTMLDivElement>(null);

  const appointmentTypes = [
    'checkup',
    'filling',
    'cleaning',
    'emergency',
    'whitening',
    'extraction',
  ];

  /* ---------- Histogram data ---------- */
  const priceMin = 0;
  const priceMax = 200;
  const bins = 10;
  const binSize = (priceMax - priceMin) / bins;
  const histogram = Array(bins).fill(0);
  appointments.forEach(({ price }) => {
    if (price >= priceMin && price <= priceMax) {
      const idx = Math.min(Math.floor((price - priceMin) / binSize), bins - 1);
      histogram[idx]++;
    }
  });

  /* ---------- keep the lifted state up-to-date ---------- */
  useEffect(() => {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (!Number.isNaN(min) && !Number.isNaN(max) && min <= max) {
      setPriceRange([min, max]);
    }
  }, [minPrice, maxPrice, setPriceRange]);

  useEffect(() => {
    setMaxDistance(distance);
  }, [distance, setMaxDistance]);

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMin: boolean,
  ) => {
    const value = e.target.value;
    if (isMin) {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const handleSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMin: boolean,
  ) => {
    const value = e.target.value;
    if (isMin) {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };


  const clearFilters = () => {
    setMinPrice(priceMin.toString());
    setMaxPrice(priceMax.toString());
    setPostcode('');
    setDistance(50);
    setDateRange(['', '']);
    setSortOption('soonest');
    setAppointmentType('');
    onFilter();
  };

  /* helpers so the slider always has a number */
  const numericMin = parseFloat(minPrice);
  const numericMax = parseFloat(maxPrice);

  return (
    <div className={styles.filters}>
      <h3 className={styles.filterTitle}>Filter Appointments</h3>

      {/* --- Sort --- */}
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

      {/* --- Appointment type --- */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Appointment Type</label>
        <select
          value={appointmentType}
          onChange={(e) => setAppointmentType(e.target.value)}
          className={styles.sortSelect}
          data-cy="filter-type-select"
        >
          <option value="">Any Type</option>
          {appointmentTypes.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* --- Price range (histogram + slider + inputs) --- */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Price Range (£)</label>

        {/* histogram */}
        <div className={styles.histogramSlider}>
          <div className={styles.histogram}>
            {histogram.map((count, i) => (
              <div
                key={i}
                className={styles.histogramBar}
                style={{ height: `${count * 5}px` }}
              />
            ))}
          </div>

          {/* double‑ended slider */}
          <div className={styles.sliderContainer} ref={sliderRef}>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={Number.isNaN(numericMin) ? priceMin : numericMin}
              onChange={(e) => handleSliderChange(e, true)}
              className={`${styles.priceSlider} ${styles.minSlider}`}
            />
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={Number.isNaN(numericMax) ? priceMax : numericMax}
              onChange={(e) => handleSliderChange(e, false)}
              className={`${styles.priceSlider} ${styles.maxSlider}`}
            />

            {/* track highlight */}
            <div
              className={styles.sliderTrack}
              style={{
                left: `${((Number.isNaN(numericMin) ? priceMin : numericMin) -
                    priceMin) /
                  (priceMax - priceMin) *
                  100
                  }%`,
                width: `${((Number.isNaN(numericMax) ? priceMax : numericMax) -
                    (Number.isNaN(numericMin) ? priceMin : numericMin)) /
                  (priceMax - priceMin) *
                  100
                  }%`,
              }}
            />
          </div>
        </div>

        {/* numeric inputs */}
        <div className={styles.priceInputs}>
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>Min</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handlePriceChange(e, true)}
              min={priceMin}
              max={numericMax || priceMax}
              className={styles.priceInput}
              data-cy="filter-price-min"
            />
          </div>
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>Max</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handlePriceChange(e, false)}
              min={numericMin || priceMin}
              max={priceMax}
              className={styles.priceInput}
              data-cy="filter-price-max"
            />
          </div>
        </div>
      </div>

      {/* --- Postcode --- */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Location (Postcode)</label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="e.g., SO31 7GT"
          className={styles.postcodeInput}
          data-cy="filter-postcode-input"
        />
      </div>

      {/* --- Distance --- */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Max Distance (miles)</label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          min={0}
          className={styles.distanceInput}
          data-cy="filter-distance"
        />
      </div>

      {/* --- Date range --- */}
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

      {/* --- Buttons --- */}
      <div className={styles.buttonGroup}>
        <button
          onClick={onFilter}
          className={styles.filterButton}
          data-cy="filter-apply"
        >
          Apply Filters
        </button>
        <button onClick={clearFilters} className={styles.clearButton}>
          Clear Filters
        </button>
      </div>
    </div>
  );
}
