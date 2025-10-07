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
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
          Home Stays
        </h1>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => handleHotelClick(hotel)}
            className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-green-200"
          >
            {/* Hotel Image */}
            <div className="relative overflow-hidden">
              <img
                src={hotel.mainImage || hotel.image}
                alt={hotel.name}
                className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Hotel Content */}
            <div className="p-4 md:p-6">
              {/* Category Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  {hotel.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors leading-tight">
                {hotel.name}
              </h2>

              {/* Location */}
              {hotel.location && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex items-center">
                  <i className="fa fa-location-dot mr-2"></i>
                  {hotel.location}
                </p>
              )}

              {/* Bottom Section */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  {hotel.stars && (
                    <div className="flex text-yellow-500 text-sm mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`${
                            i < hotel.stars
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                  {hotel.phone && (
                    <p className="text-gray-600 text-xs flex items-center">
                      <i className="fa fa-phone mr-2"></i>
                      {hotel.phone}
                    </p>
                  )}
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  View Details
                </button>
              </div>
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
