import { useContext } from "react";
import { FilterContext } from "./FilterContext";

export const useFilterContext = () => useContext(FilterContext);
