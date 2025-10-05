import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  eatingPlaceServices,
  transformApiDataToFrontend,
  getAllEatingPlaces,
} from "../../api/eating";

const Eating = () => {
  const navigate = useNavigate();
  const [eatingPlaces, setEatingPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch eating places from API
  useEffect(() => {
    const fetchEatingPlaces = async () => {
      try {
        setLoading(true);
        const response = await eatingPlaceServices.fetchEatingPlaces();

        if (response.success && response.data) {
          // Transform API data to frontend format
          const transformedData = response.data.map(transformApiDataToFrontend);
          setEatingPlaces(transformedData);
        } else {
          // Fallback to mock data if API fails
          console.warn("API response unsuccessful, using mock data");
          setEatingPlaces(getAllEatingPlaces());
        }
      } catch (error) {
        console.error("Error fetching eating places:", error);
        setError("Failed to load eating places");
        // Fallback to mock data
        setEatingPlaces(getAllEatingPlaces());
      } finally {
        setLoading(false);
      }
    };

    fetchEatingPlaces();
  }, []);

  const handleRestaurantClick = (place) => {
    navigate(`/restaurant/${place.id}`);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  // Filter eating places based on active category
  const filteredEatingPlaces =
    activeCategory === "All"
      ? eatingPlaces
      : eatingPlaces.filter(
          (place) =>
            place.category === activeCategory ||
            place.cuisine === activeCategory
        );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-5 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="bg-white rounded shadow-sm overflow-hidden"
              >
                <div className="h-35 bg-gray-200"></div>
                <div className="px-4 py-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
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
      <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-5 mt-10">
        <div className="text-center py-10">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-5 mt-10">
      <h1 className="text-2xl font-bold mb-4">Eating Out</h1>
      <p className="text-gray-700 mb-6">
        Explore the best dining options around you. Whether you're craving local
        cuisine or international flavors, we've got you covered with top-rated
        restaurants and eateries.
      </p>

      <div className="flex flex-wrap gap-4">
        {[
          "All",
          "Local Restaurants",
          "Street Food",
          "Cafes & Bakeries",
          "Fast Food",
          "Fine Dining",
        ].map((category) => (
          <span
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`cursor-pointer pb-1 ${
              activeCategory === category
                ? "border-b-2 border-green-600 text-green-600"
                : "hover:text-green-600"
            }`}
          >
            {category}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-5">
        {filteredEatingPlaces.map((place) => (
          <div
            key={place.id}
            onClick={() => handleRestaurantClick(place)}
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded"
          >
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-35 object-cover"
            />
            <div className="px-4 py-2">
              <h2 className="font-semibold text-gray-800">{place.name}</h2>
              <p className="text-xs text-gray-600">
                {" "}
                <i className="fa fa-location-dot"></i> {place.location}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {place.cuisine} • {place.category}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fa fa-star text-xs ${
                        i < place.stars ? "text-yellow-400" : "text-gray-300"
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  ({place.views} views)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEatingPlaces.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">
            No eating places found for "{activeCategory}"
          </p>
        </div>
      )}
    </div>
  );
};

export default Eating;
