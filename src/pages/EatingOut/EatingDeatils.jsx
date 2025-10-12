// src/pages/EatingOut/EatingDeatils.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  eatingPlaceServices,
  transformApiDataToFrontend,
} from "../../api/eating";
import { useCart } from "../../context/useCart";
import Toast from "../../components/Toast";
import RatingModal from "../../components/RatingModal";
import RatingDisplay from "../../components/RatingDisplay";
import { ratingsService } from "../../api/ratings";
import { useAuth } from "../../context/useAuth";

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
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);

  const { addItem } = useCart();

  const [bookingForm, setBookingForm] = useState({
    bookingDate: "",
    arrivalDate: "",
    durationMinutes: "120",
    guests: "2",
    tableId: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [restaurantRating, setRestaurantRating] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const { isAuthenticated } = useAuth();

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRateClick = () => {
    if (!isAuthenticated) {
      showToast("warning", "Please sign in to rate this restaurant");
      return;
    }
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      const response = await ratingsService.submitRestaurantRating({
        eatingPlaceId: id,
        rating: ratingData.rating,
        comment: ratingData.comment,
      });

      if (response.success) {
        showToast("success", "Thank you for your rating!");
        // Update local rating state
        setRestaurantRating((prev) => ({
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

  const handleBookingInputChange = (event) => {
    const { name, value } = event.target;
    setBookingForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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

  const handleRestaurantBooking = async (event) => {
    event.preventDefault();
    if (!restaurant) return;

    if (selectedMenuItems.length === 0) {
      showToast(
        "warning",
        "Please select at least one menu item before booking."
      );
      return;
    }

    if (!bookingForm.bookingDate) {
      showToast("warning", "Please select a booking date and time");
      return;
    }

    const guestsCount = Number(bookingForm.guests);
    if (!Number.isInteger(guestsCount) || guestsCount <= 0) {
      showToast("warning", "Guests must be a positive number");
      return;
    }

    setBookingLoading(true);

    try {
      const bookingReference = `TABLE-${restaurant.id}-${Date.now()}`;

      const metadata = {
        bookingDate: formatDateTimeForMetadata(bookingForm.bookingDate),
        guests: guestsCount,
        table: bookingForm.tableId || "Any table",
        reference: bookingReference,
        durationMinutes: Number(bookingForm.durationMinutes),
        "Menu Items": selectedMenuItems
          .map((item) => `${item.name} (x${item.quantity})`)
          .join(", "),
      };

      if (bookingForm.arrivalDate) {
        metadata.arrivalDate = formatDateTimeForMetadata(
          bookingForm.arrivalDate
        );
      }

      const totalMenuPrice = selectedMenuItems.reduce(
        (total, item) => total + parseFloat(item.price) * item.quantity,
        0
      );

      addItem({
        id: bookingReference,
        type: "restaurant",
        name: `${restaurant.name} • Table reservation`,
        price: totalMenuPrice,
        currency: "RWF",
        metadata,
      });

      showToast(
        "success",
        "Table reservation and menu items added to cart successfully!"
      );
      setSelectedMenuItems([]);
    } catch (bookingError) {
      console.error("Error booking restaurant table:", bookingError);
      showToast("error", bookingError.message || "Failed to add to cart");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddMenuItem = (menuItem) => {
    setSelectedMenuItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.menu_id === menuItem.menu_id
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.menu_id === menuItem.menu_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...menuItem, quantity: 1 }];
      }
    });
  };

  const handleRemoveMenuItem = (menuItem) => {
    setSelectedMenuItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.menu_id === menuItem.menu_id
      );
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map((item) =>
          item.menu_id === menuItem.menu_id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevItems.filter((item) => item.menu_id !== menuItem.menu_id);
      }
    });
  };

  // Fetch restaurant details from API
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);

        try {
          // Fetch restaurant data and ratings in parallel
          const [response, ratingsResponse] = await Promise.all([
            eatingPlaceServices.fetchEatingPlaceById(id),
            ratingsService.getRestaurantRatings(id),
          ]);

          if (response.success && response.data) {
            const transformedData = transformApiDataToFrontend(response.data);
            setRestaurant(transformedData);
            setSelectedImage(transformedData.image);

            // Set rating data
            if (ratingsResponse.success && ratingsResponse.data) {
              setRestaurantRating({
                averageRating:
                  ratingsResponse.data.averageRating ||
                  transformedData.stars ||
                  0,
                totalReviews:
                  ratingsResponse.data.totalReviews ||
                  transformedData.totalReviews ||
                  0,
              });
            } else if (transformedData.stars) {
              // Fallback to restaurant's star rating if ratings API fails
              setRestaurantRating({
                averageRating: transformedData.stars,
                totalReviews: transformedData.totalReviews || 0,
              });
            }
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
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
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
      <nav className="mb-6 flex items-center space-x-2 text-sm">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-800 cursor-pointer"
        >
          Home
        </button>
        <span className="text-gray-400">/</span>
        <button
          onClick={() => navigate("/eating-out")}
          className="text-green-600 hover:text-green-800 cursor-pointer"
        >
          Eating Out
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 font-medium truncate">
          {restaurant.name}
        </span>
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {restaurant.name}
            </h1>
          </div>

          {/* Image Gallery */}
          <div className="space-y-4">
            <img
              src={selectedImage || restaurant.image}
              alt={restaurant.name}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
            {restaurant.images && restaurant.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {restaurant.images.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`group relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
                      selectedImage === img
                        ? "border-green-500"
                        : "border-transparent hover:border-green-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${restaurant.name} view ${index + 1}`}
                      className="w-full h-24 object-cover group-hover:opacity-90"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* About Section */}
          <div className="py-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              About {restaurant.name}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {restaurant.description}
            </p>
          </div>

          {/* Restaurant Features */}
          <div className="py-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Features & Contact
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {restaurant.wifi && (
                <div>
                  <i className="fa fa-wifi text-green-500 mr-2"></i> Free WiFi
                </div>
              )}
              {restaurant.parking && (
                <div>
                  <i className="fa fa-parking text-green-500 mr-2"></i> Parking
                  Available
                </div>
              )}
              {restaurant.delivery && (
                <div>
                  <i className="fa fa-motorcycle text-green-500 mr-2"></i>{" "}
                  Delivery Support
                </div>
              )}
              {restaurant.totalTables > 0 && (
                <div>
                  <i className="fa fa-chair text-green-500 mr-2"></i> Table
                  Service
                </div>
              )}
              {restaurant.phone && (
                <div>
                  <i className="fa fa-phone text-green-500 mr-2"></i>{" "}
                  {restaurant.phone}
                </div>
              )}
              <div>
                <i className="fa fa-clock text-green-500 mr-2"></i> Open: 10:00
                AM - 10:00 PM
              </div>
            </div>
          </div>

          {/* Rating Display */}
          <div className="py-6 border-t border-gray-200">
            <RatingDisplay
              averageRating={restaurantRating.averageRating}
              totalReviews={restaurantRating.totalReviews}
              onRateClick={handleRateClick}
            />
          </div>
        </div>

        {/* Right Column (Booking & Menu) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Menu Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Menu</h3>
              {menuLoading ? (
                <p>Loading menu...</p>
              ) : menuError ? (
                <p className="text-gray-600 text-center py-8">{menuError}</p>
              ) : menu.length > 0 ? (
                <div className="space-y-4">
                  {menu.map((item) => {
                    const selectedItem = selectedMenuItems.find(
                      (i) => i.menu_id === item.menu_id
                    );
                    const quantity = selectedItem ? selectedItem.quantity : 0;
                    return (
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
                          <div className="ml-4 flex-shrink-0 text-center">
                            {item.image && (
                              <img
                                src={`https://travooz.kadgroupltd.com/${item.image}`}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg mb-2 mx-auto"
                              />
                            )}
                            {quantity === 0 ? (
                              <button
                                onClick={() => handleAddMenuItem(item)}
                                className="w-full bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-semibold hover:bg-green-200"
                              >
                                Add
                              </button>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleRemoveMenuItem(item)}
                                  className="bg-gray-200 text-gray-700 w-7 h-7 rounded-full"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-semibold">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => handleAddMenuItem(item)}
                                  className="bg-green-500 text-white w-7 h-7 rounded-full"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Menu not available
                </p>
              )}
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-5">
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
                <button
                  type="submit"
                  disabled={bookingLoading || selectedMenuItems.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    bookingLoading || selectedMenuItems.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {bookingLoading ? "Booking..." : "Book"}
                </button>
              </form>
            </div>
          </div>
        </div>
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
        propertyName={restaurant?.name || ""}
        propertyType="restaurant"
      />
    </div>
  );
};

export default EatingDetails;
