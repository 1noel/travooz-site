import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { homestayServices, transformApiDataToFrontend, getAllHotels } from "../../api/hotelsData";

const Hotels = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch homestays from API
  useEffect(() => {
    const fetchHomestays = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await homestayServices.fetchHomestays();
        
        if (response.success && response.data) {
          // Transform API data to frontend format
          const transformedData = response.data.map(transformApiDataToFrontend);
          setHotels(transformedData);
        } else {
          // Fallback to mock data if API fails
          console.warn("API response unsuccessful, using mock data");
          setHotels(getAllHotels());
        }
      } catch (error) {
        console.error("Error fetching homestays:", error);
        setError("Failed to load homestays");
        // Fallback to mock data
        setHotels(getAllHotels());
      } finally {
        setLoading(false);
      }
    };

    fetchHomestays();
  }, []);

  const handleHotelClick = (hotel) => {
    navigate(`/hotel/${hotel.id}`);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  // Filter hotels based on active category
  const filteredHotels = activeCategory === "All" 
    ? hotels 
    : hotels.filter(hotel => {
        // Basic category filtering - can be enhanced based on API data structure
        if (activeCategory === "Hotels") return hotel.type === "hotel" || !hotel.type;
        if (activeCategory === "Resorts") return hotel.type === "resort";
        if (activeCategory === "Apartments") return hotel.type === "apartment";
        if (activeCategory === "Villas") return hotel.type === "villa";
        return true;
      });

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 space-y-5 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex gap-4 mb-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 md:h-56 lg:h-64 bg-gray-200"></div>
                <div className="p-3 md:p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 space-y-5 mt-10">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Homestays</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 space-y-5 mt-10">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
        Home Stays
      </h1>

      <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base">
        {["All", "Hotels", "Resorts", "Apartments", "Villas"].map(category => (
          <span 
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`cursor-pointer transition-colors ${
              activeCategory === category 
                ? "border-b border-green-600 text-green-600" 
                : "hover:text-green-600"
            }`}
          >
            {category}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-5">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => handleHotelClick(hotel)}
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded-lg"
          >
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-48 md:h-56 lg:h-64 object-cover"
            />
            <div className="p-3 md:p-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                {hotel.name}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mb-2">
                <i className="fa fa-location-dot mr-1"></i>
                {hotel.location}
              </p>
              <div className="flex items-center gap-2 mt-2 mb-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < hotel.stars ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs md:text-sm text-gray-500">
                  ({hotel.views} views)
                </span>
              </div>
              <p className="text-sm md:text-base font-medium text-green-600 mt-2">
                ${hotel.price} /night
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">No homestays available</p>
        </div>
      )}
    </div>
  );
};

export default Hotels;
