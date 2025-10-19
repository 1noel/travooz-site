import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { homestayServices, transformHomestayData } from "../../api/homestays";
import { HotelList } from "../../components/HotelList";

const AvailableStays = () => {
  const location = useLocation();
  const [allHotels, setAllHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    location: "",
  });

  // Extract search parameters from the navigation state
  const searchParams = location.state || {};

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        const homestaysResponse = await homestayServices.fetchHomestays();

        if (
          !homestaysResponse?.success ||
          !Array.isArray(homestaysResponse.data)
        ) {
          setError("Failed to load homestays");
          return;
        }

        const transformedHomestays = homestaysResponse.data
          .map((homestay) => transformHomestayData(homestay))
          .filter(Boolean);

        setAllHotels(transformedHomestays);
        setFilteredHotels(transformedHomestays); // Initially show all
      } catch (err) {
        console.error("Error loading homestays:", err);
        setError("Failed to load homestays");
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let hotelsToFilter = [...allHotels];

    if (filters.name) {
      hotelsToFilter = hotelsToFilter.filter((hotel) =>
        hotel.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.location) {
      hotelsToFilter = hotelsToFilter.filter((hotel) =>
        hotel.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredHotels(hotelsToFilter);
  };

  const clearFilters = () => {
    setFilters({ name: "", location: "" });
    setFilteredHotels(allHotels);
  };

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="bg-white rounded shadow-sm overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="px-4 py-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <div className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10">
        <div className="text-center py-10">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20">
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-200 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-800"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Hotel Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Radisson Blu"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Kigali"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2 lg:col-start-4">
              <button
                onClick={applyFilters}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition-colors text-sm"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
      <HotelList
        apiData={filteredHotels}
        onFilterToggle={() => setShowFilters(!showFilters)}
        searchParams={searchParams}
      />
    </div>
  );
};

export default AvailableStays;
