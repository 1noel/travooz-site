/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FILTER_DEFAULT_SETTINGS,
  getFilterSettingsForPath,
} from "./filterSettings";

export const FilterContext = createContext({
  activeCategory: FILTER_DEFAULT_SETTINGS.category,
  setActiveCategory: () => {},
  filterValues: {
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  },
  appliedFilters: {
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  },
  setFilterValues: () => {},
  applyFilters: () => {},
  clearFilters: () => {},
});

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
    setAppliedFilters({ ...filterValues });
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
    }),
    [activeCategory, filterValues, appliedFilters, applyFilters, clearFilters]
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
