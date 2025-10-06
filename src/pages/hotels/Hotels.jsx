import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllHotels } from "../../api/hotelsData";
import { subcategoryServices } from "../../api/subcategories";

const Hotels = () => {
  const navigate = useNavigate();
  const hotels = getAllHotels();
  const [activeFilter, setActiveFilter] = useState("All");
  const [subcategories, setSubcategories] = useState([]);
  const [filterButtons, setFilterButtons] = useState(["All"]);

  useEffect(() => {
    // Fetch subcategories for Rest & Stay (category_id: 4)
    const fetchSubcategories = async () => {
      try {
        const response = await subcategoryServices.fetchSubcategoriesByCategory(
          4
        );
        if (response.success && response.data) {
          setSubcategories(response.data);
          // Create dynamic filter buttons based on subcategories
          const subcategoryNames = response.data.map((sub) => sub.name);
          setFilterButtons([
            "All",
            ...subcategoryNames,
            "Hotels",
            "Resorts",
            "Apartments",
            "Villas",
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
        // Fallback to default filters
        setFilterButtons(["All", "Hotels", "Resorts", "Apartments", "Villas"]);
      }
    };

    fetchSubcategories();
  }, []);

  const handleHotelClick = (hotel) => {
    navigate(`/hotel/${hotel.id}`);
  };

  // Function to determine hotel type based on real characteristics
  const getHotelType = (hotel) => {
    const name = hotel.name.toLowerCase();

    // Categorize based on actual hotel names and characteristics
    if (name.includes("radisson") || name.includes("grand")) {
      return "hotels"; // Traditional hotels
    } else if (name.includes("serena")) {
      return "resorts"; // Resort-style accommodation
    } else if (name.includes("peace view")) {
      return "villas"; // Villa-style lakeside accommodation
    } else {
      return "apartments"; // Other accommodations
    }
  };

  // Filter hotels based on active filter
  const filteredHotels = hotels.filter((hotel) => {
    if (activeFilter === "All") return true;

    // Check if it matches subcategory names
    const matchesSubcategory = subcategories.some(
      (sub) =>
        sub.name === activeFilter &&
        getHotelType(hotel) === sub.name.toLowerCase()
    );

    if (matchesSubcategory) return true;

    // Fallback to original hotel type matching
    return getHotelType(hotel) === activeFilter.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 space-y-5 mt-10">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
        Home Stays
      </h1>
      {/* Hotel listings will go here */}

      <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base">
        {filterButtons.map((filter) => (
          <span
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`cursor-pointer transition-colors ${
              activeFilter === filter
                ? "border-b border-green-500"
                : "hover:text-green-500"
            }`}
          >
            {filter}
          </span>
        ))}
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredHotels.length} of {hotels.length} places
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-5">
        {filteredHotels.map((hotel) => (
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
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                  {hotel.name}
                </h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getHotelType(hotel) === "hotels"
                      ? "bg-blue-100 text-blue-800"
                      : getHotelType(hotel) === "resorts"
                      ? "bg-green-100 text-green-500"
                      : getHotelType(hotel) === "villas"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {getHotelType(hotel) === "hotels"
                    ? "Hotel"
                    : getHotelType(hotel) === "resorts"
                    ? "Resort"
                    : getHotelType(hotel) === "villas"
                    ? "Villa"
                    : "Apartment"}
                </span>
              </div>
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
              <p className="text-sm md:text-base font-medium text-green-500 mt-2">
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
