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
  const [menuItemQuantities, setMenuItemQuantities] = useState({});
  const [activeMenuItem, setActiveMenuItem] = useState(null);

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

  // Menu item cart functions
  const getItemQuantity = (itemId) => {
    return menuItemQuantities[itemId] || 1;
  };

  const updateItemQuantity = (itemId, quantity) => {
    setMenuItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, quantity)
    }));
  };

  const hasUserInteracted = (itemId) => {
    return activeMenuItem === itemId;
  };

  const handleMenuItemClick = (itemId) => {
    if (activeMenuItem === itemId) {
      // If clicking on the same item, hide controls
      setActiveMenuItem(null);
    } else {
      // If clicking on a different item, show controls for this item and hide others
      setActiveMenuItem(itemId);
      // Set initial quantity if not already set
      if (!menuItemQuantities.hasOwnProperty(itemId)) {
        updateItemQuantity(itemId, 1);
      }
    }
  };

  const addMenuItemToCart = (item) => {
    const quantity = getItemQuantity(item.menu_id);
    if (quantity < 1) {
      showToast("warning", "Please select quantity first");
      return;
    }

    try {
      const cartItemId = `${restaurant.id}-menu-${item.menu_id}-${Date.now()}`;
      
      addItem({
        id: cartItemId,
        type: "food",
        name: `${item.name} (${restaurant.name})`,
        price: parseFloat(item.price),
        quantity: quantity,
        metadata: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          menuItemId: item.menu_id,
          itemName: item.name,
          itemDescription: item.description,
          itemImage: item.image,
          pricePerItem: parseFloat(item.price),
          totalPrice: parseFloat(item.price) * quantity
        }
      });

      // Reset quantity after adding to cart and hide add to cart button
      setMenuItemQuantities(prev => {
        const newState = { ...prev };
        delete newState[item.menu_id];
        return newState;
      });
      setActiveMenuItem(null); // Hide cart controls after adding to cart
      showToast("success", `${item.name} x${quantity} added to cart!`);
    } catch (error) {
      console.error("Error adding menu item to cart:", error);
      showToast("error", "Failed to add item to cart");
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
      };

      if (bookingForm.arrivalDate) {
        metadata.arrivalDate = formatDateTimeForMetadata(
          bookingForm.arrivalDate
        );
      }

      addItem({
        id: bookingReference,
        type: "restaurant",
        name: `${restaurant.name} • Table reservation`,
        metadata,
      });

      showToast("success", "Table reservation added to cart successfully!");
    } catch (bookingError) {
      console.error("Error booking restaurant table:", bookingError);
      showToast("error", bookingError.message || "Failed to add to cart");
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
        <span className="text-gray-600 capitalize">{restaurant.name}</span>
      </nav>

      {/* Restaurant Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 capitalize">
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
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                About {restaurant.name}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {restaurant.description}
              </p>
            </div>

            {/* Location & Contact Info */}
            <div className="p-5">
              <h4 className="font-semibold text-gray-800 mb-3">
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
            {/* Menu Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-green-600">🍽️</span>
                  Our Menu
                </h3>
                <p className="text-sm text-gray-600 mt-1">Discover our delicious offerings</p>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto">
                {menuLoading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse p-4 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : menuError ? (
                  <div className="text-center py-12 px-4">
                    <div className="text-gray-400 text-4xl mb-4">📋</div>
                    <p className="text-gray-600 font-medium mb-2">Menu Unavailable</p>
                    <p className="text-gray-500 text-sm">{menuError}</p>
                  </div>
                ) : menu.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {menu.map((item, index) => (
                      <div
                        key={item.menu_id}
                        onClick={() => handleMenuItemClick(item.menu_id)}
                        className={`p-4 transition-colors duration-200 cursor-pointer ${
                          hasUserInteracted(item.menu_id) 
                            ? 'bg-gray-50' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Menu Item Image */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <img
                                src={`https://travooz.kadgroupltd.com/${item.image}`}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-200"
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24'%3E🍽️%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                                <span className="text-gray-400 text-2xl">🍽️</span>
                              </div>
                            )}
                          </div>

                          {/* Menu Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between capitalize   items-start mb-2">
                              <h4 className="font-semibold text-gray-800 text-base lowercase  leading-tight">
                                {item.name}
                              </h4>
                            </div>
                            
                            <p className="text-gray-900 text-sm leading-relaxed mb-3 line-clamp-2">
                              {item.description || "Delicious dish prepared with care and quality ingredients."}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                RWF {parseFloat(item.price).toLocaleString()}
                              </span>
                            </div>
                            
                            {/* Quantity Controls and Add to Cart - Only show after user clicks on item */}
                            {hasUserInteracted(item.menu_id) && (
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateItemQuantity(item.menu_id, getItemQuantity(item.menu_id) - 1);
                                    }}
                                    disabled={getItemQuantity(item.menu_id) <= 1}
                                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold transition-colors"
                                  >
                                    −
                                  </button>
                                  <span className="w-8 text-center font-semibold text-gray-800">
                                    {getItemQuantity(item.menu_id)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateItemQuantity(item.menu_id, getItemQuantity(item.menu_id) + 1);
                                    }}
                                    className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-lg font-bold transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addMenuItemToCart(item);
                                  }}
                                  className="bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="text-gray-400 text-4xl mb-4">🍽️</div>
                    <p className="text-gray-600 font-medium mb-2">No Menu Available</p>
                    <p className="text-gray-500 text-sm">Menu information is currently not available for this restaurant.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
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
                  disabled={bookingLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    bookingLoading
                      ? "bg-green-200 text-white cursor-wait"
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
      {/* Rating Section */}
      <div className="mb-8">
        <RatingDisplay
          averageRating={restaurantRating.averageRating}
          totalReviews={restaurantRating.totalReviews}
          onRateClick={handleRateClick}
        />
      </div>
    </div>
  );
};

export default EatingDetails;
