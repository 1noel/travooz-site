import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { carServices, transformCarData, formatPrice } from "../../api/cars";

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

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center space-x-3 text-sm">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Home
        </button>
        <span className="text-gray-400">{"/"}</span>
        <button
          onClick={() => navigate("/cars")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Cars
        </button>
        <span className="text-gray-400">{"/"}</span>
        <span className="text-gray-600 font-medium truncate">
          {car.brand} {car.model}
        </span>
      </nav>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Car Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            {car.brand} {car.model}
          </h1>

          {/* Main Image */}
          <div className="mb-6">
            <img
              src={selectedImage}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* Image Gallery */}
          {car.images && car.images.length > 1 && (
            <div className="mb-8">
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

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-6">
              {/* About This Car */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  About This Car
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {car.description}
                </p>
              </div>

              {/* Car Details */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Car Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                      Location
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {car.location}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                      Year
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {car.year}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                      Seats
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {car.seatCapacity} people
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                      Transmission
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {car.transmission}
                    </span>
                  </div>
                </div>
                {car.color && (
                  <div className="mt-4">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                        Color
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {car.color}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              {car.features && Object.keys(car.features).length > 0 && (
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    Car Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(car.features)
                      .filter(([, value]) => value === true)
                      .map(([key]) => (
                        <div
                          key={key}
                          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-gray-800 font-medium leading-relaxed capitalize">
                            {key}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 h-fit max-h-[32rem]">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 h-full overflow-y-auto">
              <div className="text-center mb-6">
                <div className="bg-green-600 text-white p-4 rounded-xl mb-4">
                  <span className="text-3xl font-bold">
                    From {formatPrice(car.rates.daily, "RWF")}/day
                  </span>
                  <div className="text-green-100 text-sm mt-1">per day</div>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="mm/dd/yyyy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Days
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>1 Day</option>
                    <option>2 Days</option>
                    <option>3 Days</option>
                    <option>1 Week</option>
                    <option>2 Weeks</option>
                    <option>1 Month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Any special requirements or requests..."
                  ></textarea>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200">
                  Book Now
                </button>
                <button className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200">
                  Get Quote
                </button>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">
                  Need help? Contact us:
                </p>
                <p className="text-green-600 font-semibold text-lg">
                  +250 780006775
                </p>
                <p className="text-green-600 text-sm mt-2">info@travooz.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default CarDetails;
