import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { homestayServices, transformHomestayData } from "../../api/homestays";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from homestays API first
        const response = await homestayServices.getHomestayById(id);

        if (response.success && response.data) {
          const transformedHomestay = transformHomestayData(response.data);
          setHotel(transformedHomestay);
          setSelectedImage(transformedHomestay.mainImage || "");
        } else {
          setError("Homestay not found");
        }
      } catch (err) {
        console.error("Error fetching hotel details:", err);
        setError("Failed to load homestay details");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id]);

  // Only show amenities/features that exist in the API response
  const getAvailableAmenities = (hotel) => {
    if (!hotel || !hotel.features) return [];

    const amenityMap = {
      freeWifi: "Free WiFi",
      parking: "Parking",
      swimmingPool: "Swimming Pool",
      restaurant: "Restaurant",
      spa: "Spa",
      fitnessCenter: "Fitness Center",
      roomService: "Room Service",
      barLounge: "Bar & Lounge",
      airConditioning: "Air Conditioning",
      laundryService: "Laundry Service",
      airportShuttle: "Airport Shuttle",
      breakfastIncluded: "Breakfast Included",
      petFriendly: "Pet Friendly",
      familyRooms: "Family Rooms",
      nonSmokingRooms: "Non-Smoking Rooms",
      kitchenFacilities: "Kitchen Facilities",
      balcony: "Balcony",
      oceanView: "Ocean View",
      gardenView: "Garden View",
      wheelchairAccessible: "Wheelchair Accessible",
      meetingRooms: "Meeting Rooms",
      conferenceFacilities: "Conference Facilities",
      security24h: "24/7 Security",
    };

    return Object.entries(hotel.features)
      .filter(([, value]) => value === true || value === 1)
      .map(([key]) => amenityMap[key])
      .filter(Boolean);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
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
          className="mb-6 flex items-center gap-2 text-green-500 hover:text-green-600 font-medium"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If hotel not found, show error message
  if (!hotel) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-green-500 hover:text-green-600 font-medium"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Hotel Not Found
          </h1>
          <p className="text-gray-600">
            The hotel you're looking for doesn't exist.
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
          className="text-green-500 hover:text-green-600 cursor-pointer"
        >
          Home
        </button>
        <span className="text-gray-400">{"/"}</span>
        <button
          onClick={() => navigate("/hotels")}
          className="text-green-500 hover:text-green-600 cursor-pointer"
        >
          Hotels
        </button>
        <span className="text-gray-400">{"/"}</span>
        <span className="text-gray-600">{hotel.name}</span>
      </nav>

      {/* Hotel Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-5">{hotel.name}</h1>

        {/* Desktop Layout - Side by side */}
        <div className="hidden md:flex gap-5">
          <div className="w-[55%]">
            <img
              src={selectedImage || hotel.image}
              alt={hotel.name}
              className="w-full h-[400px] object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="w-[45%]">
            <div className="grid grid-cols-2 gap-3 h-[400px]">
              {hotel.images &&
                hotel.images.slice(0, 6).map((img, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-green-500"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${hotel.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout - Main image with horizontal thumbnails below */}
        <div className="md:hidden">
          <div className="mb-4">
            <img
              src={selectedImage || hotel.image}
              alt={hotel.name}
              className="w-full h-[300px] object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {hotel.images &&
              hotel.images.slice(0, 6).map((img, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? "border-green-500"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`${hotel.name} view ${index + 1}`}
                    className="w-20 h-20 object-cover"
                  />
                </div>
              ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-lg text-gray-600 mb-4">
            <i className="fa fa-location-dot text-green-500"></i>{" "}
            {hotel.location}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-4">
            {hotel.stars && (
              <>
                <div className="flex text-yellow-500 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < hotel.stars ? "text-yellow-500" : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600">({hotel.stars} stars)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rooms Section - Only show if rooms data exists */}
      {hotel.rooms && hotel.rooms.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Available Rooms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotel.rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-full h-48">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {room.name}
                  </h3>
                  {room.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {room.description}
                    </p>
                  )}
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities and Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Amenities - Only show if hotel has features */}
        {hotel && hotel.features && (
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Hotel Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {getAvailableAmenities(hotel).map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-green-500">✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Card */}
        <div className="bg-white border rounded-lg p-6 shadow-lg h-fit">
          <h3 className="text-xl font-semibold mb-4">Quick Booking</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in
              </label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out
              </label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </label>
              <select className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4+ Guests</option>
              </select>
            </div>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors">
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
