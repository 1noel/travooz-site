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
});

export const FilterProvider = ({ children }) => {
  const location = useLocation();
  const [activeCategory, setActiveCategoryState] = useState(() => {
    const { category } = getFilterSettingsForPath(location.pathname);
    return category;
  });

  useEffect(() => {
    const { category } = getFilterSettingsForPath(location.pathname);
    setActiveCategoryState(category);
  }, [location.pathname]);

  const setActiveCategory = (category) => {
    setActiveCategoryState(category);
  };

  const value = useMemo(
    () => ({
      activeCategory,
      setActiveCategory,
    }),
    [activeCategory]
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
