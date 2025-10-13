import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subcategoryServices } from "../../api/subcategories";
import { homestayServices, transformHomestayData } from "../../api/homestays";
import { useFilterContext } from "../../context/useFilterContext";
import Toast from "../../components/Toast";

const Hotels = () => {
  const navigate = useNavigate();
  const { appliedFilters, filterAppliedTimestamp } = useFilterContext();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        const [subcategoriesResponse, homestaysResponse] = await Promise.all([
          subcategoryServices.fetchSubcategoriesByCategory(4),
          homestayServices.fetchHomestays(),
        ]);

        const fetchedSubcategories =
          subcategoriesResponse?.success &&
          Array.isArray(subcategoriesResponse.data)
            ? subcategoriesResponse.data
            : [];

        if (isMounted) {
          const subcategoryNames = fetchedSubcategories.map((sub) => sub.name);
          setCategories(["All", ...subcategoryNames]);
        }

        if (
          !homestaysResponse?.success ||
          !Array.isArray(homestaysResponse.data)
        ) {
          if (isMounted) {
            setError("Failed to load homestays");
          }
          return;
        }

        const transformedHomestays = homestaysResponse.data
          .map((homestay) => {
            const transformed = transformHomestayData(homestay);
            if (!transformed) return null;

            if (homestay.subcategory_id && fetchedSubcategories.length > 0) {
              const matchedSubcategory = fetchedSubcategories.find(
                (sub) => sub.subcategory_id === homestay.subcategory_id
              );
              if (matchedSubcategory) {
                transformed.category = matchedSubcategory.name;
              }
            }

            return transformed;
          })
          .filter(Boolean);

        if (isMounted) {
          setHotels(transformedHomestays);
        }
      } catch (err) {
        console.error("Error loading homestays:", err);
        if (isMounted) {
          setError("Failed to load homestays");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHotels();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleHotelClick = (hotel) => {
    navigate(`/hotel/${hotel.id}`);
  };

  const handleCategoryClick = (category) => {
    setActiveFilter(category);
  };

  // Filter hotels based on active category and applied filters
  const filteredHotels = React.useMemo(() => {
    let filtered = hotels;

    // Filter by category
    if (activeFilter !== "All") {
      filtered = filtered.filter((hotel) => hotel.category === activeFilter);
    }

    // Filter by destination/location
    if (appliedFilters.destination && appliedFilters.destination.trim()) {
      const searchTerm = appliedFilters.destination.toLowerCase().trim();

      filtered = filtered.filter(
        (hotel) =>
          hotel.location?.toLowerCase().includes(searchTerm) ||
          hotel.name?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [hotels, activeFilter, appliedFilters]);

  // Show toast when filters are applied
  useEffect(() => {
    if (
      filterAppliedTimestamp > 0 &&
      appliedFilters.destination &&
      appliedFilters.destination.trim() &&
      !loading
    ) {
      const currentFilter = appliedFilters.destination;

      if (filteredHotels.length === 0 && hotels.length > 0) {
        setToast({
          message: `No stays found matching "${currentFilter}". Try different search terms.`,
          type: "warning",
        });
      } else if (filteredHotels.length > 0) {
        setToast({
          message: `Found ${filteredHotels.length} stay${
            filteredHotels.length > 1 ? "s" : ""
          } matching your search.`,
          type: "success",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAppliedTimestamp]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="bg-white rounded shadow-sm overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
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
      <h1 className="text-2xl font-bold mb-4">Home Stays</h1>

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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-5">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => handleHotelClick(hotel)}
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded"
          >
            <img
              src={hotel.mainImage || hotel.image}
              alt={hotel.name}
              className="w-full h-48 object-cover"
            />
            <div className="px-4 py-2">
              <h2 className="font-semibold text-gray-800">{hotel.name}</h2>
              <p className="text-xs text-gray-600">
                <i className="fa fa-location-dot"></i> {hotel.location}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {hotel.category}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {hotel.stars && (
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fa fa-star text-xs ${
                          i < hotel.stars ? "text-yellow-400" : "text-gray-300"
                        }`}
                      ></i>
                    ))}
                  </div>
                )}
                {hotel.phone && (
                  <span className="text-xs text-gray-500">
                    {hotel.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">
            No accommodations found for "{activeFilter}"
          </p>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Hotels;
