import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  homestayServices,
  transformHomestayData,
  transformRoomData,
} from "../../api/homestays";
import { useCart } from "../../context/useCart";
import Toast from "../../components/Toast";
import RatingModal from "../../components/RatingModal";
import RatingDisplay from "../../components/RatingDisplay";
import { ratingsService } from "../../api/ratings";
import { useAuth } from "../../context/useAuth";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomsMessage, setRoomsMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedCheckIn, setSelectedCheckIn] = useState("");
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [selectedCheckOut, setSelectedCheckOut] = useState("");
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState("1 Guest");
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [roomActionState, setRoomActionState] = useState({});
  const [toast, setToast] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hotelRating, setHotelRating] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const showBookingSection = location.state?.from !== "available-stays";

  useEffect(() => {
    if (location.state?.checkIn) {
      setSelectedCheckIn(location.state.checkIn);
    }
    if (location.state?.checkOut) {
      setSelectedCheckOut(location.state.checkOut);
    }
    if (location.state?.guests) {
      setSelectedGuests(location.state.guests);
    }
  }, [location.state]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRateClick = () => {
    if (!isAuthenticated) {
      showToast("warning", "Please sign in to rate this property");
      return;
    }
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      const response = await ratingsService.submitHomestayRating({
        homestayId: id,
        rating: ratingData.rating,
        comment: ratingData.comment,
      });

      if (response.success) {
        showToast("success", "Thank you for your rating!");
        setHotelRating((prev) => ({
          averageRating: response.data.averageRating || prev.averageRating,
          totalReviews: prev.totalReviews + 1,
        }));
      } else {
        showToast("error", response.error || "Failed to submit rating");
      }
    } catch {
      showToast("error", "An error occurred while submitting your rating");
    }
  };

  const handleCheckHotelAvailability = async () => {
    if (!selectedCheckIn || !selectedCheckOut) {
      showToast("warning", "Please select check-in and check-out dates");
      return;
    }

    if (!hotel.rooms || hotel.rooms.length === 0) {
      showToast("warning", "No rooms available at this time");
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityResults(null);

    try {
      const availabilityChecks = hotel.rooms.map(async (room) => {
        try {
          const response = await homestayServices.checkRoomAvailability({
            roomId: room.id,
            checkIn: selectedCheckIn,
            checkOut: selectedCheckOut,
            guests: parseGuestsCount(),
          });
          return {
            room,
            available: response.success,
            message: response.data?.message || "",
          };
        } catch {
          return {
            room,
            available: false,
            message: "Unable to check availability",
          };
        }
      });

      const results = await Promise.all(availabilityChecks);
      const availableRooms = results.filter((r) => r.available);

      setAvailabilityResults({
        total: results.length,
        available: availableRooms.length,
        rooms: results,
      });

      if (availableRooms.length > 0) {
        showToast(
          "success",
          `${availableRooms.length} room(s) available for your dates!`
        );
      } else {
        showToast("warning", "No rooms available for the selected dates");
      }
    } catch {
      showToast("error", "Failed to check availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  };

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

  const updateRoomState = (roomId, updates) => {
    setRoomActionState((previous) => ({
      ...previous,
      [roomId]: {
        ...(previous[roomId] ?? {}),
        ...updates,
      },
    }));
  };

  const parseGuestsCount = () => {
    const numeric = parseInt(selectedGuests, 10);
    if (Number.isNaN(numeric) || numeric <= 0) {
      return 1;
    }
    return numeric;
  };

  const formatDateForMetadata = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  const ensureDatesSelected = () => {
    if (!selectedCheckIn || !selectedCheckOut) {
      return false;
    }
    return true;
  };

  const handleBookRoom = async (room) => {
    if (!ensureDatesSelected()) {
      showToast("warning", "Please select check-in and check-out dates first");
      return;
    }

    updateRoomState(room.id, {
      bookingLoading: true,
    });

    try {
      const bookingReference = `ROOM-${room.id}-${Date.now()}`;
      const generatedId = bookingReference;

      addItem({
        id: generatedId,
        type: "room",
        name: `${hotel.name} • ${room.name}`,
        price: room.price,
        currency: room.currency || "RWF",
        metadata: {
          checkIn: formatDateForMetadata(selectedCheckIn),
          checkOut: formatDateForMetadata(selectedCheckOut),
          guests: parseGuestsCount(),
          reference: bookingReference,
        },
      });

      updateRoomState(room.id, {
        bookingLoading: false,
      });

      showToast("success", "Room added to cart successfully!");
    } catch (error) {
      updateRoomState(room.id, {
        bookingLoading: false,
      });
      showToast(
        "error",
        error.message || "Failed to add to cart. Please try again."
      );
    }
  };

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [homestayResponse, roomsResponse, ratingsResponse] =
          await Promise.all([
            homestayServices.getHomestayById(id),
            homestayServices.fetchRoomsByHomestayId(id),
            ratingsService.getHomestayRatings(id),
          ]);

        if (homestayResponse.success && homestayResponse.data) {
          const transformedHomestay = transformHomestayData(
            homestayResponse.data
          );

          let rooms = [];
          let roomsNotice = "";

          if (roomsResponse.success && Array.isArray(roomsResponse.data)) {
            rooms = roomsResponse.data
              .map((room) => transformRoomData(room))
              .filter(Boolean);

            if (rooms.length === 0) {
              roomsNotice = "Rooms are not available right now.";
            }
          } else {
            roomsNotice = "Rooms are not available right now.";
          }

          const combinedHotel = {
            ...transformedHomestay,
            rooms,
          };

          setHotel(combinedHotel);
          setSelectedImage(combinedHotel.mainImage || "");
          setRoomsMessage(roomsNotice);

          // Set rating data
          if (ratingsResponse.success && ratingsResponse.data) {
            setHotelRating({
              averageRating:
                ratingsResponse.data.averageRating || combinedHotel.stars || 0,
              totalReviews:
                ratingsResponse.data.totalReviews ||
                combinedHotel.totalReviews ||
                0,
            });
          } else if (combinedHotel.stars) {
            // Fallback to hotel's star rating if ratings API fails
            setHotelRating({
              averageRating: combinedHotel.stars,
              totalReviews: combinedHotel.totalReviews || 0,
            });
          }
        } else {
          setError("Homestay not found");
        }
      } catch (err) {
        console.error("Error fetching hotel details:", err);
        setError("Failed to load homestay details");
        setRoomsMessage("Rooms are not available right now.");
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

  const getStatusBadgeClasses = (status) => {
    if (!status) return "";

    const normalized = status.toString().toLowerCase().replace(/\s+/g, "");

    if (["available", "open", "active"].includes(normalized)) {
      return "bg-green-50 text-green-700 border border-green-200";
    }

    if (
      ["unavailable", "closed", "inactive", "booked", "occupied"].includes(
        normalized
      )
    ) {
      return "bg-red-50 text-red-600 border border-red-200";
    }

    if (
      ["limited", "pending", "partial", "reserved", "onhold"].includes(
        normalized
      )
    ) {
      return "bg-amber-50 text-amber-600 border border-amber-200";
    }

    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const formatBedsLabel = (beds) => {
    if (beds === null || beds === undefined || beds === "") return null;

    const numericBeds = Number(beds);
    if (!Number.isNaN(numericBeds)) {
      return `${numericBeds} ${numericBeds === 1 ? "Bed" : "Beds"}`;
    }

    return beds;
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-5">
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-2/5"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-4"
              >
                <div className="h-40 bg-gray-200 rounded-lg"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3 lg:col-span-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded"></div>
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

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="relative">
              <img
                src={selectedImage || hotel.image}
                alt={hotel.name}
                className="w-full h-[280px] md:h-[420px] object-cover rounded-xl shadow-lg"
              />
            </div>

            {hotel.images && hotel.images.length > 0 && (
              <div
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                role="list"
                aria-label="Gallery thumbnails"
              >
                {hotel.images.slice(0, 6).map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`group relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      selectedImage === img
                        ? "border-green-500"
                        : "border-transparent hover:border-green-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${hotel.name} view ${index + 1}`}
                      className="w-full h-20 md:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {selectedImage === img && (
                      <span
                        className="absolute inset-0 bg-black/10"
                        aria-hidden="true"
                      ></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Booking Sidebar - Conditionally Rendered */}
          {showBookingSection && (
            <div className="w-full lg:w-[360px] xl:w-[400px]">
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg w-full lg:sticky lg:top-24">
                <h3 className="text-xl font-semibold mb-6 text-center lg:text-left">
                  Quick Booking
                </h3>
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
                            ? new Date(selectedCheckIn).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : ""
                        }
                        placeholder="Select check-in date"
                        readOnly
                        onClick={() =>
                          setShowCheckInCalendar(!showCheckInCalendar)
                        }
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
                            ? new Date(selectedCheckOut).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : ""
                        }
                        placeholder="Select check-out date"
                        readOnly
                        onClick={() =>
                          setShowCheckOutCalendar(!showCheckOutCalendar)
                        }
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
                        onClick={() =>
                          setShowGuestsDropdown(!showGuestsDropdown)
                        }
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
                  <button
                    onClick={handleCheckHotelAvailability}
                    disabled={checkingAvailability}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                      checkingAvailability
                        ? "bg-green-400 cursor-wait"
                        : "bg-green-600 hover:bg-green-700 transform hover:-translate-y-0.5"
                    } text-white`}
                  >
                    {checkingAvailability
                      ? "Checking..."
                      : "Check Availability"}
                  </button>
                  {availabilityResults && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        Availability Results:
                      </p>
                      <p className="text-sm text-gray-700">
                        {availabilityResults.available} of{" "}
                        {availabilityResults.total} room(s) available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
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

          {hotel.description && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                About this stay
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {hotel.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rooms Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Available Rooms</h2>
          {roomsMessage && (
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {roomsMessage}
            </span>
          )}
        </div>

        {hotel.rooms && hotel.rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotel.rooms.map((room) => {
              const roomState = roomActionState[room.id] ?? {};
              const { bookingLoading } = roomState;
              const stats = [];

              if (room.size) {
                stats.push({ icon: "fa-ruler-combined", label: room.size });
              }

              const bedsLabel = formatBedsLabel(room.beds);
              if (bedsLabel) {
                stats.push({ icon: "fa-bed", label: bedsLabel });
              }

              if (room.capacity) {
                stats.push({
                  icon: "fa-user-group",
                  label: `Sleeps ${room.capacity}`,
                });
              }

              const amenities = Array.isArray(room.amenities)
                ? room.amenities.filter(Boolean)
                : [];
              const displayedAmenities = amenities.slice(0, 4);
              const remainingAmenitiesCount = Math.max(
                amenities.length - displayedAmenities.length,
                0
              );

              return (
                <div
                  key={room.id}
                  className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded"
                >
                  <img
                    src={room.mainImage || room.image}
                    alt={room.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="px-4 py-2">
                    <h2 className="font-semibold text-gray-800">{room.name}</h2>
                    {room.status && (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${getStatusBadgeClasses(
                          room.status
                        )}`}
                      >
                        {room.status}
                      </span>
                    )}

                    {(room.shortDescription || room.description) && (
                      <p className="text-xs text-gray-600 mt-1">
                        {room.shortDescription || room.description}
                      </p>
                    )}

                    {stats.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {stats.slice(0, 2).map((stat, index) => (
                          <span
                            key={`${stat.label}-${index}`}
                            className="text-xs text-gray-500"
                          >
                            <i
                              className={`fa ${stat.icon} mr-1 text-green-600`}
                            ></i>
                            {stat.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {remainingAmenitiesCount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{remainingAmenitiesCount} more amenities
                      </p>
                    )}

                    {room.price && (
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        {new Intl.NumberFormat("en-RW", {
                          style: "currency",
                          currency: room.currency || "RWF",
                          currencyDisplay: "code",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(room.price)}
                        <span className="text-xs text-gray-500 ml-1">
                          / night
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleBookRoom(room)}
                      disabled={bookingLoading}
                      className={`w-full px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                        bookingLoading
                          ? "bg-green-200 text-white cursor-wait"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {bookingLoading ? "Booking..." : "Book"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !roomsMessage && (
            <div className="text-gray-500 text-sm bg-gray-50 border border-dashed border-gray-200 rounded-lg p-5">
              Rooms are not available right now.
            </div>
          )
        )}
      </div>

      {/* Amenities */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Hotel Amenities</h3>
        {(() => {
          const availableAmenities = hotel ? getAvailableAmenities(hotel) : [];
          if (availableAmenities.length === 0) {
            return (
              <p className="text-gray-500 text-sm bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4">
                Amenity details will be available soon. Please check back later.
              </p>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableAmenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-green-500">✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <div className="mt-12">
        <RatingDisplay
          averageRating={hotelRating.averageRating}
          totalReviews={hotelRating.totalReviews}
          onRateClick={handleRateClick}
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        propertyName={hotel?.name || ""}
        propertyType="hotel"
      />
    </div>
  );
};

export default HotelDetails;
