import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  eatingPlaceServices,
  transformApiDataToFrontend,
} from "../../api/eating";

const EatingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  // Fetch restaurant details from API
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);

        try {
          // First try to fetch from API
          const response = await eatingPlaceServices.fetchEatingPlaceById(id);

          if (response.success && response.data) {
            const transformedData = transformApiDataToFrontend(response.data);
            setRestaurant(transformedData);
            setSelectedImage(transformedData.image);
          } else {
            setError("Restaurant not found");
          }
        } catch (apiError) {
          console.error("API fetch failed:", apiError);
          setError("Failed to load restaurant details");
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        setError("Failed to load restaurant details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantDetails();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-2/3 mb-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-[350px] bg-gray-200 rounded-lg"></div>
              <div className="flex gap-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="w-20 h-16 bg-gray-200 rounded-lg"
                  ></div>
                ))}
              </div>
              <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="rounded-lg shadow-sm h-[400px] bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Restaurant
          </h1>
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

  // If restaurant not found, show error message
  if (!restaurant) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Restaurant Not Found
          </h1>
          <p className="text-gray-600">
            The restaurant you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center space-x-2 text-md">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-800 cursor-pointer"
        >
          Home
        </button>
        <span className="text-gray-400">{"/"}</span>
        <button
          onClick={() => navigate("/eating-out")}
          className="text-green-600 hover:text-green-800 cursor-pointer"
        >
          Eating Out
        </button>
        <span className="text-gray-400">{"/"}</span>
        <span className="text-gray-600">{restaurant.name}</span>
      </nav>

      {/* Restaurant Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {restaurant.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Grid - 60% Left, 40% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* Left Side - Restaurant Image, Description, Features, Location, Contact (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Restaurant Image Gallery */}
          <div className="mb-6">
            {/* Main Image */}
            <div className="mb-4">
              <img
                src={selectedImage || restaurant.image}
                alt={restaurant.name}
                className="w-full h-[350px] object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Image Thumbnails */}
            {restaurant.images && restaurant.images.length > 1 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  More Photos ({restaurant.images.length})
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {restaurant.images.map((img, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === img
                          ? "border-green-500 ring-2 ring-green-200 shadow-lg"
                          : "border-gray-200 hover:border-green-300 hover:shadow-md"
                      }`}
                      onClick={() => setSelectedImage(img)}
                      title={`View photo ${index + 1}`}
                    >
                      <img
                        src={img}
                        alt={`${restaurant.name} view ${index + 1}`}
                        className="w-20 h-16 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            {/* Description */}
            <div className=" p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                About {restaurant.name}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {restaurant.description}
              </p>
            </div>

            {/* Location & Contact Info */}
            <div className="p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Location & Contact
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <i className="fa fa-location-dot text-green-600 w-5"></i>
                  <span className="text-gray-700">{restaurant.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa fa-clock text-green-600 w-5"></i>
                  <span className="text-gray-700">
                    Open: 10:00 AM - 10:00 PM
                  </span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-phone text-green-600 w-5"></i>
                    <span className="text-gray-700">{restaurant.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <i className="fa fa-envelope text-green-600 w-5"></i>
                  <span className="text-gray-700">
                    info@{restaurant.name.toLowerCase().replace(/\s+/g, "")}.rw
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Features */}
          <div className="bg-white  rounded-lg p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Restaurant Features
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {restaurant.wifi && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <span className="text-green-600 text-xs">✓</span>
                  <span className="text-gray-700">Free WiFi</span>
                </div>
              )}
              {restaurant.parking && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <span className="text-green-600 text-xs">✓</span>
                  <span className="text-gray-700">Parking Available</span>
                </div>
              )}
              {restaurant.delivery && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <span className="text-green-600 text-xs">✓</span>
                  <span className="text-gray-700">Delivery Support</span>
                </div>
              )}
              {restaurant.totalTables > 0 && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <span className="text-green-600 text-xs">✓</span>
                  <span className="text-gray-700">Table Service</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Restaurant Info (40%) */}
        <div className="lg:col-span-2">
          <div className="sticky top-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Restaurant Info
            </h3>
            <div className="bg-white rounded-lg shadow-sm p-4">
              {restaurant.menuItemsCount > 0 ? (
                <p className="text-gray-600 text-center py-8">
                  Menu has {restaurant.menuItemsCount} items
                </p>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Menu information not available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EatingDetails;
