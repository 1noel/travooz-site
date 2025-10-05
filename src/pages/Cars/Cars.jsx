import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  carServices,
  transformCarData,
  getAvailabilityStatus,
  formatPrice,
} from "../../api/cars";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredCars, setFilteredCars] = useState([]);
  const navigate = useNavigate();

  const categories = ["All", "Economy", "SUV & Van", "Luxury", "Premium", "Utility"];

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await carServices.fetchCars();

        if (response.success && response.data) {
          const transformedCars = response.data.map(transformCarData);
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

    fetchCars();
  }, []);

  // Filter cars based on selected category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredCars(cars);
    } else {
      setFilteredCars(
        cars.filter((car) => car.category === selectedCategory)
      );
    }
  }, [cars, selectedCategory]);

  const handleCarClick = (car) => {
    navigate(`/car/${car.id}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 space-y-5 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-12">
        <div className="text-center">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-lg"></div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Unable to Load Cars
          </h1>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the car rentals. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 space-y-5 mt-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
          Car Rentals
        </h1>
        <p className="text-gray-700 text-base md:text-lg leading-relaxed">
          Find the perfect vehicle for your journey in Rwanda. From economy cars 
          for city exploration to luxury vehicles for special occasions, we have 
          a wide range of well-maintained cars available for rent.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span className="font-medium text-sm md:text-base">{error}</span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-2 md:gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-200 text-sm md:text-base ${
                selectedCategory === category
                  ? "bg-green-600 text-white shadow-lg transform -translate-y-0.5"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Car */}
      {filteredCars.length > 0 && (
        <div className="mb-10 md:mb-14">
          <div
            onClick={() => handleCarClick(filteredCars[0])}
            className="relative cursor-pointer group overflow-hidden rounded-xl shadow-lg bg-white border border-gray-100 hover:border-green-200"
          >
            <div className="grid lg:grid-cols-2 items-center">
              <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
                <img
                  src={filteredCars[0].mainImage}
                  alt={`${filteredCars[0].brand} ${filteredCars[0].model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4">
                  {(() => {
                    const availability = getAvailabilityStatus(filteredCars[0]);
                    return (
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold text-white ${
                        availability.color === 'green' ? 'bg-green-600' : 
                        availability.color === 'red' ? 'bg-red-600' : 'bg-yellow-600'
                      }`}>
                        {availability.status === 'available' ? 'Available' : 
                         availability.status === 'unavailable' ? 'Unavailable' : 'Contact Us'}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4">
                  <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                    Featured Vehicle
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                    {filteredCars[0].category}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors leading-tight">
                  {filteredCars[0].brand} {filteredCars[0].model}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {filteredCars[0].year} • {filteredCars[0].transmission} • {filteredCars[0].fuelType}
                </p>
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3 text-sm md:text-base">
                  {filteredCars[0].description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    {formatPrice(filteredCars[0].rates.daily)}/day
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm md:text-base">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cars Grid */}
      {filteredCars.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
            No Cars Found
          </h3>
          <p className="text-gray-500 text-sm md:text-base">
            {selectedCategory === "All"
              ? "No cars are currently available."
              : `No cars found in the "${selectedCategory}" category.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-8">
          {filteredCars.slice(1).map((car) => (
            <div
              key={car.id}
              onClick={() => handleCarClick(car)}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-green-200"
            >
              {/* Car Image */}
              <div className="relative overflow-hidden">
                <img
                  src={car.mainImage}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-green-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold">
                    {car.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  {(() => {
                    const availability = getAvailabilityStatus(car);
                    return (
                      <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold text-white ${
                        availability.color === 'green' ? 'bg-green-600' : 
                        availability.color === 'red' ? 'bg-red-600' : 'bg-yellow-600'
                      }`}>
                        {availability.status === 'available' ? 'Available' : 
                         availability.status === 'unavailable' ? 'Unavailable' : 'Contact'}
                      </span>
                    );
                  })()}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Car Content */}
              <div className="p-4 md:p-6">
                {/* Title */}
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors leading-tight">
                  {car.brand} {car.model}
                </h2>

                {/* Car Details */}
                <div className="text-gray-600 text-sm mb-3">
                  {car.year} • {car.seatCapacity} seats • {car.transmission}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-4">
                  <i className="fa fa-location-dot text-green-600"></i>
                  <span>{car.location}</span>
                </div>

                {/* Features */}
                {car.features && Object.keys(car.features).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(car.features)
                      .filter(([, value]) => value === true)
                      .slice(0, 3)
                      .map(([key]) => (
                        <span
                          key={key}
                          className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                          {key.toUpperCase()}
                        </span>
                      ))}
                  </div>
                )}

                {/* Price and Book Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xl md:text-2xl font-bold text-green-600">
                      {formatPrice(car.rates.daily)}
                    </span>
                    <span className="text-gray-500 text-xs md:text-sm ml-1 block">
                      per day
                    </span>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-green-50 rounded-xl p-6 md:p-8 text-center border border-green-100">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Need a Custom Vehicle Solution?
        </h3>
        <p className="text-gray-600 mb-6 text-base md:text-lg">
          Can't find what you're looking for? Contact us for special requests 
          or long-term rental arrangements.
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base">
          Contact Us
        </button>
      </div>
    </div>
  );
};

export default Cars;