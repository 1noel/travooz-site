import { useEffect, useMemo, useState } from "react";
import { locationServices } from "../api/locations";

const CATEGORIES_WITH_LOCATION_API = new Set(["restStay", "tourPackages"]);

// Popular cities in Rwanda for car rental and other categories
const RWANDA_POPULAR_CITIES = [
  "Kigali",
  "Musanze (Ruhengeri)",
  "Rubavu (Gisenyi)",
  "Huye (Butare)",
  "Karongi",
  "Nyanza",
  "Rusizi (Cyangugu)",
  "Muhanga",
  "Nyagatare",
  "Rwamagana",
];

export const useLocationSuggestions = (categoryKey) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isEnabled = useMemo(
    () =>
      CATEGORIES_WITH_LOCATION_API.has(categoryKey) ||
      categoryKey === "carRental",
    [categoryKey]
  );

  useEffect(() => {
    let isMounted = true;

    const loadLocations = async () => {
      if (!isEnabled) {
        setSuggestions([]);
        return;
      }

      // For car rental, use hardcoded Rwanda cities
      if (categoryKey === "carRental") {
        setSuggestions(RWANDA_POPULAR_CITIES);
        return;
      }

      try {
        setIsLoading(true);
        const response = await locationServices.fetchLocations();
        if (!isMounted) return;

        if (response?.success && Array.isArray(response.data)) {
          const names = response.data
            .map((location) => location?.location_name)
            .filter(Boolean);
          setSuggestions(names);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load locations:", error);
          setSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLocations();

    return () => {
      isMounted = false;
    };
  }, [categoryKey, isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      setIsLoading(false);
    }
  }, [isEnabled]);

  return { suggestions, isLoading, isEnabled };
};
