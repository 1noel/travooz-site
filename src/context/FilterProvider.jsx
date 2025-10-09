import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FilterContext } from "./FilterContext";
import { getFilterSettingsForPath } from "./filterSettings";

export const FilterProvider = ({ children }) => {
  const location = useLocation();
  const [activeCategory, setActiveCategoryState] = useState(() => {
    const { category } = getFilterSettingsForPath(location.pathname);
    return category;
  });

  // Filter values state
  const [filterValues, setFilterValuesState] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  // Applied filters state (what's actually being used for filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  // Timestamp to track when filters are applied
  const [filterAppliedTimestamp, setFilterAppliedTimestamp] = useState(0);

  useEffect(() => {
    const { category } = getFilterSettingsForPath(location.pathname);
    setActiveCategoryState(category);
  }, [location.pathname]);

  const setActiveCategory = (category) => {
    setActiveCategoryState(category);
  };

  const setFilterValues = (values) => {
    setFilterValuesState((prev) => ({
      ...prev,
      ...values,
    }));
  };

  const applyFilters = React.useCallback(() => {
    console.log("📌 FilterProvider - Applying filters:", filterValues);
    setAppliedFilters({ ...filterValues });
    setFilterAppliedTimestamp(Date.now());
    console.log("📌 FilterProvider - Filters applied!");
  }, [filterValues]);

  const clearFilters = React.useCallback(() => {
    const emptyFilters = {
      destination: "",
      checkIn: "",
      checkOut: "",
      guests: "",
    };
    setFilterValuesState(emptyFilters);
    setAppliedFilters(emptyFilters);
  }, []);

  const value = useMemo(
    () => ({
      activeCategory,
      setActiveCategory,
      filterValues,
      setFilterValues,
      appliedFilters,
      applyFilters,
      clearFilters,
      filterAppliedTimestamp,
    }),
    [
      activeCategory,
      filterValues,
      appliedFilters,
      applyFilters,
      clearFilters,
      filterAppliedTimestamp,
    ]
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
