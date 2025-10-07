import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subcategoryServices } from "../../api/subcategories";
import { homestayServices, transformHomestayData } from "../../api/homestays";
import Filter from "../../components/Filter";

const Hotels = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  // Helper function to get subcategory name by ID
  const getSubcategoryName = React.useCallback(
    (subcategoryId) => {
      const subcategory = subcategories.find(
        (sub) => sub.subcategory_id === subcategoryId
      );
      return subcategory ? subcategory.name : "Other";
    },
    [subcategories]
  );

  // Fetch subcategories for Home Stays (category_id: 4)
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await subcategoryServices.fetchSubcategoriesByCategory(
          4
        );
        if (response.success && response.data) {
          setSubcategories(response.data);
          // Create dynamic categories based on subcategories
          const subcategoryNames = response.data.map((sub) => sub.name);
          setCategories(["All", ...subcategoryNames]);
        }
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      }
    };

    fetchSubcategories();
  }, []);

  // Fetch homestays from API
  useEffect(() => {
    const fetchHomestays = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await homestayServices.fetchHomestays();

        if (response.success && response.data) {
          const transformedHomestays = response.data
            .map((homestay) => {
              const transformed = transformHomestayData(homestay);
              // Override category with actual subcategory name if available
              if (homestay.subcategory_id && subcategories.length > 0) {
                transformed.category = getSubcategoryName(
                  homestay.subcategory_id
                );
              }
              return transformed;
            })
            .filter(Boolean);
          setHotels(transformedHomestays);
        } else {
          setError("Failed to load homestays");
        }
      } catch (err) {
        console.error("Error fetching homestays:", err);
        setError("Failed to load homestays");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch homestays after subcategories are loaded
    if (subcategories.length > 0) {
      fetchHomestays();
    }
  }, [subcategories, getSubcategoryName]);

  const handleHotelClick = (hotel) => {
    navigate(`/hotel/${hotel.id}`);
  };

  const handleCategoryClick = (category) => {
    setActiveFilter(category);
  };

  // Filter hotels based on active category
  const filteredHotels =
    activeFilter === "All"
      ? hotels
      : hotels.filter((hotel) => hotel.category === activeFilter);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10">
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
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
        Home Stays
      </h1>

      {/* Search Filter */}
      <Filter />

      {/* Category Filter */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <span
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`cursor-pointer pb-1 transition-colors ${
                activeFilter === category
                  ? "border-b-2 border-green-500 text-green-500"
                  : "hover:text-green-500"
              }`}
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredHotels.length} of {hotels.length} places
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-5">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => handleHotelClick(hotel)}
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded-lg"
          >
            <img
              src={hotel.mainImage || hotel.image}
              alt={hotel.name}
              className="w-full h-48 md:h-56 object-cover"
            />
            <div className="p-3 md:p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                  {hotel.name}
                </h2>
                <span className="inline-block bg-green-600 text-white text-xs font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                  {hotel.category}
                </span>
              </div>
              {hotel.location && (
                <p className="text-xs md:text-sm text-gray-600 mb-2">
                  <i className="fa fa-location-dot mr-1"></i>
                  {hotel.location}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 mb-2">
                {hotel.stars && (
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
                )}
              </div>
              {hotel.phone && (
                <p className="text-xs md:text-sm text-gray-600 mt-2">
                  <i className="fa fa-phone mr-1"></i>
                  {hotel.phone}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
            No Accommodations Found
          </h3>
          <p className="text-gray-500 text-sm md:text-base">
            {activeFilter === "All"
              ? "No accommodations are currently available."
              : `No accommodations found in the "${activeFilter}" category.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Hotels;
