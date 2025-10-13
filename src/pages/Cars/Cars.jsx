import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { carServices, transformCarData, formatPrice } from "../../api/cars";
import { subcategoryServices } from "../../api/subcategories";
import { useFilterContext } from "../../context/useFilterContext";
import Toast from "../../components/Toast";

const Cars = () => {
  const { appliedFilters, filterAppliedTimestamp } = useFilterContext();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredCars, setFilteredCars] = useState([]);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    // Fetch subcategories first
    const fetchSubcategories = async () => {
      try {
        const response = await subcategoryServices.fetchSubcategoriesByCategory(
          5
        ); // Category 5 is Car Rental
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

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await carServices.fetchCars();

        if (response.success && response.data) {
          const transformedCars = response.data
            .map((car) => {
              const transformed = transformCarData(car);
              // Override category with actual subcategory name
              if (transformed) {
                transformed.category = getSubcategoryName(car.subcategory_id);
              }
              return transformed;
            })
            .filter(Boolean);
          setCars(transformedCars);
        } else {
          setError("Failed to load cars");
        }
      } catch (err) {
        console.error("Error fetching cars:", err);
        setError("Failed to load cars");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch cars after subcategories are loaded
    if (subcategories.length > 0) {
      fetchCars();
    }
  }, [subcategories, getSubcategoryName]);

  // Filter cars based on selected category and applied filters
  useEffect(() => {
    let filtered = cars;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((car) => car.category === selectedCategory);
    }

    // Filter by pickup location (destination in filter context)
    if (appliedFilters.destination && appliedFilters.destination.trim()) {
      const searchTerm = appliedFilters.destination.toLowerCase().trim();
      filtered = filtered.filter(
        (car) =>
          car.location?.toLowerCase().includes(searchTerm) ||
          car.name?.toLowerCase().includes(searchTerm) ||
          car.model?.toLowerCase().includes(searchTerm) ||
          car.brand?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredCars(filtered);
  }, [cars, selectedCategory, appliedFilters]);

  // Show toast when filters are applied
  useEffect(() => {
    if (
      filterAppliedTimestamp > 0 &&
      appliedFilters.destination &&
      appliedFilters.destination.trim() &&
      !loading
    ) {
      const currentFilter = appliedFilters.destination;

      if (filteredCars.length === 0 && cars.length > 0) {
        setToast({
          message: `No cars found matching "${currentFilter}". Try different search terms.`,
          type: "warning",
        });
      } else if (filteredCars.length > 0) {
        setToast({
          message: `Found ${filteredCars.length} car${
            filteredCars.length > 1 ? "s" : ""
          } matching your search.`,
          type: "success",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAppliedTimestamp]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleCarClick = (car) => {
    navigate(`/car/${car.id}`);
  };

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
      <h1 className="text-2xl font-bold mb-4">Car Rentals</h1>

      <div className="flex flex-wrap gap-4">
        {categories.map((category) => (
          <span
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`cursor-pointer pb-1 transition-colors ${
              selectedCategory === category
                ? "border-b-2 border-green-500 text-green-500"
                : "hover:text-green-500"
            }`}
          >
            {category}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-5">
        {filteredCars.map((car) => (
          <div
            key={car.id}
            onClick={() => handleCarClick(car)}
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded"
          >
            <img
              src={car.mainImage}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-48 object-cover"
            />
            <div className="px-4 py-2">
              <h2 className="font-semibold text-gray-800">{car.brand} {car.model}</h2>
              <p className="text-xs text-gray-600">
                <i className="fa fa-location-dot"></i> {car.location}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {car.category} / {car.year}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {car.seatCapacity} seats • {car.transmission}
                </span>
              </div>
              <div className="mt-2">
                <span className="font-bold text-green-600">
                  {formatPrice(car.rates.daily, car.currency)}/day
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">
            No cars found for "{selectedCategory}"
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

export default Cars;
