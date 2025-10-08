import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  eatingPlaceServices,
  transformApiDataToFrontend,
} from "../../api/eating";
import { useCart } from "../../context/useCart";

const EatingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const { addItem } = useCart();

  const [bookingForm, setBookingForm] = useState({
    bookingDate: "",
    arrivalDate: "",
    durationMinutes: "120",
    guests: "2",
    tableId: "",
  });
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const handleBookingInputChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    if (bookingStatus) {
      setBookingStatus(null);
      setBookingMessage("");
    }
    if (availabilityStatus) {
      setAvailabilityStatus(null);
      setAvailabilityMessage("");
    }
  };

  const coerceDateTimePayload = (value) => {
    if (!value) return undefined;
    if (value.length === 16) {
      return `${value}:00`;
    }
    return value;
  };

  const formatDateTimeForMetadata = (value) => {
    if (!value) return "";
    try {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString();
      }
    } catch (error) {
      console.warn("Failed to format date", error);
    }
    return value.replace("T", " ");
  };

  const handleCheckAvailability = async () => {
    if (!restaurant) return;

    if (!bookingForm.bookingDate) {
      setAvailabilityStatus("error");
      setAvailabilityMessage(
        "Select a booking date and time before checking availability."
      );
      return;
    }

    const guestsCount = Number(bookingForm.guests);
    if (!Number.isInteger(guestsCount) || guestsCount <= 0) {
      setAvailabilityStatus("error");
      setAvailabilityMessage("Guests must be a positive number.");
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityStatus(null);
    setAvailabilityMessage("");

    try {
      const payload = {
        restaurantId: restaurant.id,
        bookingDate: coerceDateTimePayload(bookingForm.bookingDate),
        guests: guestsCount,
      };

      const minutesValue = Number(bookingForm.durationMinutes);
      if (!Number.isNaN(minutesValue) && minutesValue > 0) {
        payload.durationMinutes = minutesValue;
      }

      const response = await eatingPlaceServices.checkRestaurantAvailability(
        payload
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to check availability.");
      }

      const availabilityData = response.data || {};
      const isUnavailable = availabilityData.available === false;

      if (isUnavailable) {
        setAvailabilityStatus("error");
        setAvailabilityMessage(
          availabilityData.reason ||
            availabilityData.message ||
            "No tables are available for the selected slot."
        );
      } else {
        setAvailabilityStatus("success");
        setAvailabilityMessage(
          availabilityData.message ||
            "A table is available for the selected slot."
        );
      }
    } catch (availabilityError) {
      console.error(
        "Error checking restaurant availability:",
        availabilityError
      );
      setAvailabilityStatus("error");
      setAvailabilityMessage(
        availabilityError.message || "Failed to check availability."
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleRestaurantBooking = async (event) => {
    event.preventDefault();
    if (!restaurant) return;

    if (!bookingForm.bookingDate) {
      setBookingStatus("error");
      setBookingMessage("Select a booking date and time before submitting.");
      return;
    }

    const guestsCount = Number(bookingForm.guests);
    if (!Number.isInteger(guestsCount) || guestsCount <= 0) {
      setBookingStatus("error");
      setBookingMessage("Guests must be a positive number.");
      return;
    }

    setBookingLoading(true);
    setBookingStatus(null);
    setBookingMessage("");

    try {
      const payload = {
        restaurantId: restaurant.id,
        bookingDate: coerceDateTimePayload(bookingForm.bookingDate),
        guests: guestsCount,
      };

      const arrivalPayload = coerceDateTimePayload(bookingForm.arrivalDate);
      if (arrivalPayload) {
        payload.arrivalDate = arrivalPayload;
      }

      const minutesValue = Number(bookingForm.durationMinutes);
      if (!Number.isNaN(minutesValue) && minutesValue > 0) {
        payload.durationMinutes = minutesValue;
      }

      if (bookingForm.tableId) {
        payload.tableId = bookingForm.tableId;
      }

      const response = await eatingPlaceServices.bookRestaurantTable(payload);

      if (!response.success) {
        throw new Error(response.error || "Failed to book table.");
      }

      const bookingReference =
        response.data?.booking_reference ||
        response.data?.booking_id ||
        response.data?.reference ||
        response.data?.code ||
        response.data?.id;

      const metadata = {
        bookingDate: formatDateTimeForMetadata(bookingForm.bookingDate),
        guests: guestsCount,
        table: bookingForm.tableId || "Any table",
        reference: bookingReference,
      };

      if (bookingForm.arrivalDate) {
        metadata.arrivalDate = formatDateTimeForMetadata(
          bookingForm.arrivalDate
        );
      }

      if (minutesValue && !Number.isNaN(minutesValue)) {
        metadata.durationMinutes = minutesValue;
      }

      addItem({
        id: bookingReference || `restaurant-${restaurant.id}-${Date.now()}`,
        type: "restaurant",
        name: `${restaurant.name} • Table reservation`,
        metadata,
      });

      setBookingStatus("success");
      setBookingMessage(
        response.data?.message || "Reservation added to your cart."
      );
    } catch (bookingError) {
      console.error("Error booking restaurant table:", bookingError);
      setBookingStatus("error");
      setBookingMessage(bookingError.message || "Failed to book table.");
    } finally {
      setBookingLoading(false);
    }
  };

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

  // Fetch menu data separately
  useEffect(() => {
    const fetchMenuData = async () => {
      if (!restaurant || !id) return;

      try {
        setMenuLoading(true);
        setMenuError(null);

        const response = await eatingPlaceServices.fetchMenuById(id);

        if (response.success && response.data && response.data.menu) {
          setMenu(response.data.menu);
        } else {
          setMenuError("Menu not available");
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        setMenuError("Failed to load menu");
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenuData();
  }, [restaurant, id]);

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

        {/* Right Side - Menu Section (40%) */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Reserve a Table
              </h3>
              <form className="space-y-4" onSubmit={handleRestaurantBooking}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking date & time
                  </label>
                  <input
                    type="datetime-local"
                    name="bookingDate"
                    value={bookingForm.bookingDate}
                    onChange={handleBookingInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival time (optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="arrivalDate"
                    value={bookingForm.arrivalDate}
                    onChange={handleBookingInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <input
                      type="number"
                      name="guests"
                      min="1"
                      value={bookingForm.guests}
                      onChange={handleBookingInputChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="durationMinutes"
                      min="30"
                      step="15"
                      value={bookingForm.durationMinutes}
                      onChange={handleBookingInputChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table number (optional)
                  </label>
                  <input
                    type="text"
                    name="tableId"
                    value={bookingForm.tableId}
                    onChange={handleBookingInputChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 12"
                  />
                </div>

                {availabilityMessage && (
                  <p
                    className={`text-sm ${
                      availabilityStatus === "success"
                        ? "text-green-600"
                        : "text-rose-500"
                    }`}
                  >
                    {availabilityMessage}
                  </p>
                )}

                {bookingMessage && (
                  <p
                    className={`text-sm ${
                      bookingStatus === "success"
                        ? "text-green-600"
                        : "text-rose-500"
                    }`}
                  >
                    {bookingMessage}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleCheckAvailability}
                    disabled={availabilityLoading || bookingLoading}
                    className={`w-full sm:w-1/2 py-3 px-4 rounded-lg font-semibold border transition-colors ${
                      availabilityLoading || bookingLoading
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-green-600 border-green-500 hover:bg-green-50"
                    }`}
                  >
                    {availabilityLoading ? "Checking..." : "Check availability"}
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className={`w-full sm:w-1/2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                      bookingLoading
                        ? "bg-green-200 text-white cursor-wait"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {bookingLoading ? "Booking..." : "Book & add to cart"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Menu</h3>
              {menuLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse border-b border-gray-100 pb-4 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : menuError ? (
                <p className="text-gray-600 text-center py-8">{menuError}</p>
              ) : menu.length > 0 ? (
                <div className="space-y-4">
                  {menu.map((item) => (
                    <div
                      key={item.menu_id}
                      className="border-b border-gray-100 pb-4 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {item.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2">
                            {item.description}
                          </p>
                          <p className="text-green-600 font-bold">
                            RWF {parseFloat(item.price).toLocaleString()}
                          </p>
                        </div>
                        {item.image && (
                          <div className="ml-4 flex-shrink-0">
                            <img
                              src={`https://travooz.kadgroupltd.com/${item.image}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
