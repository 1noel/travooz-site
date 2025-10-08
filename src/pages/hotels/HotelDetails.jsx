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
  const [selectedCheckIn, setSelectedCheckIn] = useState("");
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [selectedCheckOut, setSelectedCheckOut] = useState("");
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState("1 Guest");
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Calendar component for check-in/check-out
  const CustomCalendar = ({ onDateSelect, onClose }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const [displayMonth, setDisplayMonth] = useState(currentMonth);
    const [displayYear, setDisplayYear] = useState(currentYear);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const getDaysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
      return new Date(year, month, 1).getDay();
    };

    const handleDateSelect = (day) => {
      const date = new Date(displayYear, displayMonth, day);
      const formattedDate = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
      onDateSelect(formattedDate);
      onClose();
    };

    const handlePrevMonth = () => {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear(displayYear - 1);
      } else {
        setDisplayMonth(displayMonth - 1);
      }
    };

    const handleNextMonth = () => {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear(displayYear + 1);
      } else {
        setDisplayMonth(displayMonth + 1);
      }
    };

    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        displayMonth === currentMonth &&
        displayYear === currentYear;
      const isPast =
        new Date(displayYear, displayMonth, day) <
        new Date(currentYear, currentMonth, today.getDate());

      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateSelect(day)}
          disabled={isPast}
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
            isToday
              ? "bg-green-600 text-white shadow-lg"
              : isPast
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-green-100 hover:text-green-600"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[displayMonth]} {displayYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">{days}</div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDateSelect("");
              onClose();
            }}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    );
  };

  // Custom Guests Dropdown component
  const CustomGuestsDropdown = () => {
    const guestOptions = [
      { value: "1 Guest", label: "1 Guest" },
      { value: "2 Guests", label: "2 Guests" },
      { value: "3 Guests", label: "3 Guests" },
      { value: "4+ Guests", label: "4+ Guests" },
    ];

    const handleGuestSelect = (option) => {
      setSelectedGuests(option.value);
      setShowGuestsDropdown(false);
    };

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
        {guestOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleGuestSelect(option)}
            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
              selectedGuests === option.value
                ? "bg-green-50 text-green-600 font-medium"
                : "text-gray-700"
            } ${index === 0 ? "rounded-t-xl" : ""} ${
              index === guestOptions.length - 1 ? "rounded-b-xl" : ""
            }`}
          >
            <span className="font-medium">{option.label}</span>
            {selectedGuests === option.value && (
              <span>
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

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
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg h-fit">
          <h3 className="text-xl font-semibold mb-6">Quick Booking</h3>
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Check-in
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={
                    selectedCheckIn
                      ? new Date(selectedCheckIn).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : ""
                  }
                  placeholder="Select check-in date"
                  readOnly
                  onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all text-gray-700 bg-white shadow-sm hover:border-gray-300 cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
              </div>
              {showCheckInCalendar && (
                <CustomCalendar
                  onDateSelect={setSelectedCheckIn}
                  onClose={() => setShowCheckInCalendar(false)}
                />
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Check-out
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={
                    selectedCheckOut
                      ? new Date(selectedCheckOut).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : ""
                  }
                  placeholder="Select check-out date"
                  readOnly
                  onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all text-gray-700 bg-white shadow-sm hover:border-gray-300 cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
              </div>
              {showCheckOutCalendar && (
                <CustomCalendar
                  onDateSelect={setSelectedCheckOut}
                  onClose={() => setShowCheckOutCalendar(false)}
                />
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Guests
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white text-gray-700 shadow-sm hover:border-gray-300 text-left flex items-center justify-between"
                >
                  <span className="font-medium">{selectedGuests}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      showGuestsDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {showGuestsDropdown && <CustomGuestsDropdown />}
              </div>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
