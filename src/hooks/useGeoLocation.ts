"use client"

import { useState, useEffect } from "react";

interface GeoLocationState {
  loading: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
}

export const useGeoLocation = () => {
  const [state, setState] = useState<GeoLocationState>({
    loading: false,
    error: null,
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    const success = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const error = () => {
      setState({
        loading: false,
        error: "Unable to retrieve your location",
        latitude: null,
        longitude: null,
      });
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }, []);

  return state;
};