import React from "react";
import { useNavigate } from "react-router-dom";
import { getAllHotels } from "../../api/hotelsData";

const Hotels = () => {
  const navigate = useNavigate();
  const hotels = getAllHotels();

  const handleHotelClick = (hotel) => {
    navigate(`/hotel/${hotel.id}`);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 space-y-5 mt-10">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
        Home Stays
      </h1>
      {/* Hotel listings will go here */}

      <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base">
        <span className="border-b border-green-600 cursor-pointer">All</span>
        <span className="cursor-pointer hover:text-green-600 transition-colors">
          Hotels
        </span>
        <span className="cursor-pointer hover:text-green-600 transition-colors">
          Resorts
        </span>
        <span className="cursor-pointer hover:text-green-600 transition-colors">
          Apartments
        </span>
        <span className="cursor-pointer hover:text-green-600 transition-colors">
          Villas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-5">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => handleHotelClick(hotel)}
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded-lg"
          >
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-48 md:h-56 lg:h-64 object-cover"
            />
            <div className="p-3 md:p-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                {hotel.name}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mb-2">
                {" "}
                <i className="fa fa-location-dot mr-1"></i>
                {hotel.location}
              </p>
              <div className="flex items-center gap-2 mt-2 mb-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < hotel.stars ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs md:text-sm text-gray-500">
                  ({hotel.views} views)
                </span>
              </div>
              <p className="text-sm md:text-base font-medium text-green-600 mt-2">
                ${hotel.price} /night
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
