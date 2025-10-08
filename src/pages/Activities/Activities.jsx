import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  activityServices,
  transformActivityToFrontend,
  filterActivities,
} from "../../api/activities";
import { subcategoryServices } from "../../api/subcategories";
import { locationServices } from "../../api/locations";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [locations, setLocations] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const navigate = useNavigate();

  // Note: Activities category doesn't have subcategories in the system
  // Fetch subcategories for Activities (category_id: 1)
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await subcategoryServices.fetchSubcategoriesByCategory(
          1
        );
        if (response.success && response.data) {
          setSubcategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      }
    };

    fetchSubcategories();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await activityServices.fetchActivities();
        console.log("Activities API Response:", response);

        if (response?.data && Array.isArray(response.data)) {
          const transformedActivities = response.data.map((activity) => {
            const transformed = transformActivityToFrontend(activity);
            return transformed;
          });
          setActivities(transformedActivities);
          setFilteredActivities(transformedActivities);
        } else {
          setError("No activities available");
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setError("Failed to load activities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch activities immediately
    fetchActivities();
  }, []);

  // Fetch locations from the dedicated API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await locationServices.fetchLocations();
        if (response.success && response.data) {
          // Extract location names from the API response
          const locationNames = response.data.map(
            (location) => location.location_name
          );
          setLocations(locationNames);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter activities when search criteria change
  useEffect(() => {
    const filters = {
      search: searchTerm,
      location: selectedLocation,
      subcategory: selectedSubcategory,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : null,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : null,
    };

    let filtered = filterActivities(activities, filters);

    // Additional subcategory filtering
    if (selectedSubcategory) {
      filtered = filtered.filter(
        (activity) => activity.subcategory === selectedSubcategory
      );
    }

    setFilteredActivities(filtered);
  }, [
    activities,
    searchTerm,
    selectedLocation,
    selectedSubcategory,
    priceRange,
  ]);

  const handleActivityClick = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setSelectedSubcategory("");
    setPriceRange({ min: "", max: "" });
    setShowLocationDropdown(false);
    setShowCategoryDropdown(false);
  };

  // Custom Location Dropdown component
  const CustomLocationDropdown = () => {
    const locationOptions = [
      { value: "", label: "All Locations" },
      ...locations.map((location) => ({ value: location, label: location })),
    ];

    const handleLocationSelect = (option) => {
      setSelectedLocation(option.value);
      setShowLocationDropdown(false);
    };

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
        {locationOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleLocationSelect(option)}
            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
              selectedLocation === option.value
                ? "bg-green-50 text-green-600 font-medium"
                : "text-gray-700"
            } ${index === 0 ? "rounded-t-xl" : ""} ${
              index === locationOptions.length - 1 ? "rounded-b-xl" : ""
            }`}
            style={{
              borderRadius:
                index === 0
                  ? "0.75rem 0.75rem 0 0"
                  : index === locationOptions.length - 1
                  ? "0 0 0.75rem 0.75rem"
                  : "0",
            }}
          >
            <span className="font-medium">{option.label}</span>
            {selectedLocation === option.value && (
              <span>
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  // Custom Category Dropdown component
  const CustomCategoryDropdown = () => {
    const categoryOptions = [
      { value: "", label: "All Categories" },
      ...subcategories.map((subcategory) => ({
        value: subcategory.name,
        label: subcategory.name,
      })),
    ];

    const handleCategorySelect = (option) => {
      setSelectedSubcategory(option.value);
      setShowCategoryDropdown(false);
    };

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
        {categoryOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleCategorySelect(option)}
            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
              selectedSubcategory === option.value
                ? "bg-green-50 text-green-600 font-medium"
                : "text-gray-700"
            } ${index === 0 ? "rounded-t-xl" : ""} ${
              index === categoryOptions.length - 1 ? "rounded-b-xl" : ""
            }`}
            style={{
              borderRadius:
                index === 0
                  ? "0.75rem 0.75rem 0 0"
                  : index === categoryOptions.length - 1
                  ? "0 0 0.75rem 0.75rem"
                  : "0",
            }}
          >
            <span className="font-medium">{option.label}</span>
            {selectedSubcategory === option.value && (
              <span>
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLocationDropdown && !event.target.closest(".location-dropdown")) {
        setShowLocationDropdown(false);
      }
      if (showCategoryDropdown && !event.target.closest(".category-dropdown")) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLocationDropdown, showCategoryDropdown]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-11 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-9 bg-gray-200 rounded-full w-20"
                ></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-8">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            <i className="fa fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Activities & Adventures
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Activities
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-700 bg-white shadow-sm hover:border-gray-300"
              />
              <i className="fa fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Location Filter */}
          <div className="location-dropdown">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white text-gray-700 shadow-sm hover:border-gray-300 text-left flex items-center justify-between"
              >
                <span className="font-medium">
                  {selectedLocation || "All Locations"}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    showLocationDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showLocationDropdown && <CustomLocationDropdown />}
            </div>
          </div>

          {/* Subcategory Filter */}
          <div className="category-dropdown">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white text-gray-700 shadow-sm hover:border-gray-300 text-left flex items-center justify-between"
              >
                <span className="font-medium">
                  {selectedSubcategory || "All Categories"}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    showCategoryDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showCategoryDropdown && <CustomCategoryDropdown />}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Price (RWF)
            </label>
            <input
              type="number"
              placeholder="Min price"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-700 bg-white shadow-sm hover:border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price (RWF)
            </label>
            <input
              type="number"
              placeholder="Max price"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-700 bg-white shadow-sm hover:border-gray-300"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm ||
          selectedLocation ||
          selectedSubcategory ||
          priceRange.min ||
          priceRange.max) && (
          <div className="mt-4 text-center">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              <i className="fa fa-times mr-2"></i>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          {["All", ...subcategories.map((sub) => sub.name)].map((category) => (
            <span
              key={category}
              onClick={() =>
                setSelectedSubcategory(category === "All" ? "" : category)
              }
              className={`cursor-pointer pb-1 transition-colors ${
                (category === "All" && selectedSubcategory === "") ||
                selectedSubcategory === category
                  ? "border-b-2 border-green-500 text-green-500"
                  : "hover:text-green-500"
              }`}
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredActivities.length} of {activities.length} activities
        </p>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <i className="fa fa-search"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No activities found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity.id)}
              className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white cursor-pointer rounded-lg border border-gray-100 hover:border-green-200 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={activity.mainImage}
                  alt={activity.name}
                  className="w-full h-48 md:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "/images/kgl.jpg";
                  }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-3 md:p-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
                  {activity.name}
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mb-2 flex items-center gap-1">
                  <i className="fa fa-location-dot text-green-600"></i>{" "}
                  {activity.location}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {activity.subcategory} • {activity.category}
                </p>
                {activity.price && (
                  <p className="text-sm md:text-base font-semibold text-green-600 mt-2">
                    {new Intl.NumberFormat("en-RW", {
                      style: "currency",
                      currency: "RWF",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(activity.price)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activities;
