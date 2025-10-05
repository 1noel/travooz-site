import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHotelById } from "../../api/hotelsData";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const amenities = [
    "Free WiFi",
    "Swimming Pool",
    "Restaurant",
    "Gym",
    "Spa",
    "Room Service",
  ];

  // Find the hotel based on the ID from URL parameters
  const hotel = getHotelById(id);

  // State to manage the currently selected image
  const [selectedImage, setSelectedImage] = useState(hotel?.image || "");

  // If hotel not found, show error message
  if (!hotel) {
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
          className="text-green-600 hover:text-green-800 cursor-pointer"
        >
          Home
        </button>
        <span className="text-gray-400">{">"}</span>
        <button
          onClick={() => navigate("/hotels")}
          className="text-green-600 hover:text-green-800 cursor-pointer"
        >
          Hotels
        </button>
        <span className="text-gray-400">{">"}</span>
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
            <i className="fa fa-location-dot text-green-600"></i>{" "}
            {hotel.location}
          </p>

          {/* Rating and Views */}
          <div className="flex items-center gap-4 mb-4">
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
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Available Rooms
        </h2>
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => {
              const container = document.getElementById("rooms-container");
              container.scrollLeft -= 300;
            }}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
            style={{ marginTop: "20px" }}
          >
            <i className="fa fa-chevron-left text-gray-600"></i>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => {
              const container = document.getElementById("rooms-container");
              container.scrollLeft += 300;
            }}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
            style={{ marginTop: "20px" }}
          >
            <i className="fa fa-chevron-right text-gray-600"></i>
          </button>

          <div
            id="rooms-container"
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitScrollbar: { display: "none" },
            }}
          >
            {hotel.rooms &&
              hotel.rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex-shrink-0 w-86"
                >
                  {/* Room Image - Top */}
                  <div className="w-full">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-55 object-cover"
                    />
                  </div>

                  {/* Room Content - Bottom */}
                  <div className="px-5 py-2">
                    <div className="flex flex-col justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {room.name}
                      </h3>
                      <span className="text-xl font-semibold text-green-600">
                        {room.price} RWF
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span>
                        <i className="fa fa-expand-arrows-alt mr-1"></i>
                        {room.size}
                      </span>
                      <span>
                        <i className="fa fa-users mr-1"></i>Up to{" "}
                        {room.maxGuests} guests
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-4">
                        {room.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">
                        Room Features:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {room.features &&
                          room.features.map((feature, index) => (
                            <span key={index} className="text-gray-600 text-sm">
                              • {feature}
                              {index < room.features.length - 1 && (
                                <span className="ml-2"></span>
                              )}
                            </span>
                          ))}
                      </div>
                    </div>

                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                      Book
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Amenities and Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Amenities */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Hotel Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-green-600">✓</span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

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
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors">
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
