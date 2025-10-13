import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryServices } from "../api/categories_api";
import { useFilterContext } from "../context/useFilterContext";

const resolveCategoryConfig = (categoryName) => {
  const normalizedName = categoryName.toLowerCase();

  if (normalizedName.includes("eating")) {
    return { route: "/eating-out", filterKey: "eatingOut" };
  }

  if (normalizedName.includes("activities")) {
    return { route: "/activities", filterKey: "activities" };
  }

  if (normalizedName.includes("tour") || normalizedName.includes("package")) {
    return { route: "/tour-packages", filterKey: "tourPackages" };
  }

  if (normalizedName.includes("car") || normalizedName.includes("rental")) {
    return { route: "/cars", filterKey: "carRental" };
  }

  if (
    normalizedName.includes("rest") ||
    normalizedName.includes("stay") ||
    normalizedName.includes("hotel")
  ) {
    return { route: "/hotels", filterKey: "restStay" };
  }

  if (normalizedName.includes("blog")) {
    return { route: "/blogs", filterKey: "default" };
  }

  return { route: null, filterKey: null };
};

const Categories = () => {
  // Categories are now displayed in the header navigation
  // This component can be used for additional category-specific content or removed entirely
  return null;
};

export default Categories;
