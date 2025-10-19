import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper function to get amenities from the hotel feature object
function getAvailableAmenities(hotel) {
  const amenities = [];
  if (!hotel.features) return amenities;

  const featureMap = {
    freeWifi: { icon: "fa-wifi", label: "Free WiFi" },
    parking: { icon: "fa-parking", label: "Parking" },
    breakfastIncluded: { icon: "fa-coffee", label: "Breakfast" },
    familyRooms: { icon: "fa-users", label: "Family Rooms" },
    restaurant: { icon: "fa-utensils", label: "Restaurant" },
    fitnessCenter: { icon: "fa-dumbbell", label: "Fitness Center" },
    swimmingPool: { icon: "fa-person-swimming", label: "Pool" },
    airConditioning: { icon: "fa-wind", label: "AC" },
    spa: { icon: "fa-spa", label: "Spa" },
    barLounge: { icon: "fa-martini-glass-citrus", label: "Bar" },
    roomService: { icon: "fa-concierge-bell", label: "Room Service" },
  };

  for (const key in hotel.features) {
    if (hotel.features[key] && featureMap[key]) {
      amenities.push(featureMap[key]);
    }
  }
  return amenities;
}

function HotelCard({ hotel, view }) {
  const navigate = useNavigate();
  const availableAmenities = getAvailableAmenities(hotel);
  const mainImage = hotel.mainImage || "/placeholder.svg";

  const handleCardClick = () => {
    navigate(`/hotel/${hotel.id}`);
  };

  if (view === "list") {
    return (
      <div
        className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-green-500/20 rounded-lg cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-72 h-48 md:h-auto flex-shrink-0">
            <img
              src={mainImage}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            {hotel.featured && (
              <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          <div className="flex-1 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 h-full">
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-green-500 mb-2 hover:underline">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <i className="fa fa-map-pin text-green-500"></i>
                  <span>{hotel.location}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {hotel.shortDescription}
                </p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {availableAmenities.slice(0, 4).map((amenity) => (
                    <div
                      key={amenity.label}
                      className="flex items-center gap-1.5 text-sm text-gray-700"
                    >
                      <i className={`fa ${amenity.icon}`}></i>
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                  {availableAmenities.length > 4 && (
                    <span className="text-sm text-green-500">
                      +{availableAmenities.length - 4} more
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-auto">
                  <span className="font-medium">Phone:</span> {hotel.phone}
                </div>
              </div>
              <div className="flex flex-row md:flex-col items-end justify-between md:justify-start gap-2 flex-shrink-0">
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold w-full md:w-auto">
                  See availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className="overflow-hidden hover:shadow-lg transition-shadow bg-white border border-green-500/20 rounded-lg group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={mainImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hotel.featured && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-green-500 mb-2 hover:underline line-clamp-1">
          {hotel.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
          <i className="fa fa-map-pin text-green-500 flex-shrink-0"></i>
          <span className="line-clamp-1">{hotel.location}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {hotel.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {availableAmenities.slice(0, 3).map((amenity) => (
            <div
              key={amenity.label}
              className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded"
            >
              <i className={`fa ${amenity.icon}`}></i>
              <span>{amenity.label}</span>
            </div>
          ))}
          {availableAmenities.length > 3 && (
            <div className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded">
              +{availableAmenities.length - 3} more
            </div>
          )}
        </div>
        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Contact:</span>
            <div className="text-xs">{hotel.phone}</div>
          </div>
          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold">
            View details
          </button>
        </div>
      </div>
    </div>
  );
}

export function HotelList({ apiData, onFilterToggle }) {
  const [view, setView] = useState("list");
  const hotels = apiData || [];

  return (
    <div>
      <div className="bg-green-500 text-white py-8 px-4 my-6 rounded-lg">
        <div className="mx-auto">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Stay</h1>
          <p className="text-green-50">{hotels.length} properties available</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onFilterToggle}
            className="border border-green-500 text-green-500 hover:bg-green-50 bg-transparent px-3 py-1.5 rounded-md text-sm flex items-center"
          >
            <i className="fa fa-sliders-h w-4 h-4 mr-2"></i>
            Filters
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">View:</span>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-md text-sm ${
              view === "list"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "border border-green-500 text-green-500 hover:bg-green-50"
            }`}
          >
            <i className="fa fa-list w-4 h-4"></i>
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-1.5 rounded-md text-sm ${
              view === "grid"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "border border-green-500 text-green-500 hover:bg-green-50"
            }`}
          >
            <i className="fa fa-grip-horizontal w-4 h-4"></i>
          </button>
        </div>
      </div>
      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No hotels available at the moment.</p>
        </div>
      ) : (
        <>
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} view={view} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
