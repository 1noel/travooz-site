import { createContext } from "react";
import { FILTER_DEFAULT_SETTINGS } from "./filterSettings";

export const FilterContext = createContext({
  activeCategory: FILTER_DEFAULT_SETTINGS.category,
  setActiveCategory: () => {},
});
