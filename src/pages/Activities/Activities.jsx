import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  activityServices,
  transformActivityToFrontend,
  getUniqueLocations,
  filterActivities,
} from "../../api/activities";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [locations, setLocations] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await activityServices.fetchActivities();
        console.log("Activities API Response:", response);

        if (response?.data && Array.isArray(response.data)) {
          const transformedActivities = response.data.map(
            transformActivityToFrontend
          );
          setActivities(transformedActivities);
          setFilteredActivities(transformedActivities);

          // Extract unique locations
          const uniqueLocations = getUniqueLocations(response.data);
          setLocations(uniqueLocations);
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

    fetchActivities();
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
      minPrice: priceRange.min ? parseFloat(priceRange.min) : null,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : null,
    };

    const filtered = filterActivities(activities, filters);
    setFilteredActivities(filtered);
  }, [activities, searchTerm, selectedLocation, priceRange]);

  const handleActivityClick = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setPriceRange({ min: "", max: "" });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto"></div>
        </div>

        {/* Filters skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index}>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Activities grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Activities & Adventures
        </h1>
        <p className="text-gray-600">
          Discover exciting activities and experiences
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Activities
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <i className="fa fa-search absolute right-3 top-3 text-gray-400"></i>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price (RWF)
            </label>
            <input
              type="number"
              placeholder="Min price"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price (RWF)
            </label>
            <input
              type="number"
              placeholder="Max price"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm ||
          selectedLocation ||
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity.id)}
              className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded"
            >
              <img
                src={activity.mainImage}
                alt={activity.name}
                className="w-full h-35 object-cover"
                onError={(e) => {
                  e.target.src = "/images/kgl.jpg";
                }}
                loading="lazy"
              />
              <div className="px-4 py-2">
                <h2 className="font-semibold text-gray-800">{activity.name}</h2>
                <p className="text-xs text-gray-600">
                  <i className="fa fa-location-dot"></i> {activity.location}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.subcategory} • {activity.category}
                </p>
                {activity.price && (
                  <p className="text-sm font-medium text-green-600 mt-2">
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
