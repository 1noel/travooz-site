import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  carServices,
  transformCarData,
  getAvailabilityStatus,
  formatPrice,
} from "../../api/cars";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [relatedCars, setRelatedCars] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific car
        const carResponse = await carServices.getCarById(id);

        if (carResponse.success && carResponse.data) {
          const transformedCar = transformCarData(carResponse.data);
          setCar(transformedCar);
          setSelectedImage(transformedCar.mainImage);

          // Fetch all cars for related cars
          const allCarsResponse = await carServices.fetchCars();
          if (allCarsResponse.success && allCarsResponse.data) {
            const otherCars = allCarsResponse.data
              .filter((c) => c.car_id !== parseInt(id))
              .map(transformCarData)
              .filter((c) => c.category === transformedCar.category)
              .slice(0, 3); // Get 3 related cars
            setRelatedCars(otherCars);
          }
        } else {
          setError("Car not found");
        }
      } catch (err) {
        console.error("Error fetching car:", err);
        setError("Failed to load car details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarData();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 md:h-80 lg:h-96 bg-gray-200 rounded-xl mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !car) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-lg"></div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Car Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The car you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/cars")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Browse All Cars
          </button>
        </div>
      </div>
    );
  }

  const availability = getAvailabilityStatus(car);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 md:mb-8 flex items-center space-x-3 text-sm">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Home
        </button>
        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        <button
          onClick={() => navigate("/cars")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Cars
        </button>
        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        <span className="text-gray-600 font-medium truncate">
          {car.brand} {car.model}
        </span>
      </nav>

      {/* Car Header */}
      <article>
        <header className="mb-6 md:mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {car.brand} {car.model}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="font-semibold">{car.year}</span>
                <span>•</span>
                <span>{car.transmission}</span>
                <span>•</span>
                <span>{car.fuelType}</span>
                <span>•</span>
                <span>{car.seatCapacity} seats</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white ${
                availability.color === 'green' ? 'bg-green-600' : 
                availability.color === 'red' ? 'bg-red-600' : 'bg-yellow-600'
              }`}>
                {availability.status === 'available' ? 'Available Now' : 
                 availability.status === 'unavailable' ? 'Currently Unavailable' : 'Contact for Availability'}
              </span>
            </div>
          </div>

          {/* Location and Category */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <i className="fa fa-location-dot text-green-600"></i>
              <span className="font-medium">{car.location}</span>
            </div>
            <span className="bg-green-600 text-white px-3 py-1.5 rounded-full font-semibold">
              {car.category}
            </span>
            {car.licensePlate && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">
                {car.licensePlate}
              </span>
            )}
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-6 md:mb-8">
          <img
            src={selectedImage}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-64 md:h-80 lg:h-96 xl:h-[480px] object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Image Gallery */}
        {car.images && car.images.length > 1 && (
          <div className="mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Gallery
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {car.images.map((img, index) => (
                <div
                  key={img.id}
                  className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img.url
                      ? "border-green-500 ring-2 ring-green-200"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <img
                    src={img.url}
                    alt={`${car.brand} ${car.model} ${index + 1}`}
                    className="w-20 h-16 md:w-24 md:h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Car Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {car.description}
              </p>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Year</span>
                <span className="text-gray-900">{car.year}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Transmission</span>
                <span className="text-gray-900 capitalize">{car.transmission}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Fuel Type</span>
                <span className="text-gray-900 capitalize">{car.fuelType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Seats</span>
                <span className="text-gray-900">{car.seatCapacity}</span>
              </div>
              {car.color && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">Color</span>
                  <span className="text-gray-900 capitalize">{car.color}</span>
                </div>
              )}
              {car.mileage && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-600">Mileage</span>
                  <span className="text-gray-900">{car.mileage} km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        {car.features && Object.keys(car.features).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(car.features)
                .filter(([, value]) => value === true)
                .map(([key]) => (
                  <div key={key} className="flex items-center gap-2 text-gray-700">
                    <i className="fa fa-check text-green-600"></i>
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-gray-50 rounded-xl p-6 md:p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Rental Rates</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Daily Rate</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(car.rates.daily)}
              </p>
              <p className="text-sm text-gray-600 mt-1">per day</p>
            </div>
            {car.rates.weekly > 0 && (
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Weekly Rate</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(car.rates.weekly)}
                </p>
                <p className="text-sm text-gray-600 mt-1">per week</p>
              </div>
            )}
            {car.rates.monthly > 0 && (
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Monthly Rate</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(car.rates.monthly)}
                </p>
                <p className="text-sm text-gray-600 mt-1">per month</p>
              </div>
            )}
          </div>
          <div className="mt-6 text-center">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base">
              Book Now
            </button>
          </div>
        </div>
      </article>

      {/* Related Cars */}
      {relatedCars.length > 0 && (
        <section className="border-t border-gray-200 pt-8 md:pt-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">
            Similar Cars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {relatedCars.map((relatedCar) => (
              <article
                key={relatedCar.id}
                onClick={() => navigate(`/car/${relatedCar.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-green-200 group"
              >
                <img
                  src={relatedCar.mainImage}
                  alt={`${relatedCar.brand} ${relatedCar.model}`}
                  className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 md:p-6">
                  <h4 className="font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors text-base md:text-lg group-hover:text-green-600">
                    {relatedCar.brand} {relatedCar.model}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {relatedCar.year} • {relatedCar.seatCapacity} seats
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(relatedCar.rates.daily)}/day
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {relatedCar.category}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <div className="bg-green-50 rounded-xl p-6 md:p-8 text-center border border-green-100 mt-8 md:mt-12 shadow-sm">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Ready to Hit the Road?
        </h3>
        <p className="text-gray-600 mb-6 text-base md:text-lg">
          Book this car now or contact us for special rates and custom arrangements.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base">
            Book This Car
          </button>
          <button className="bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;