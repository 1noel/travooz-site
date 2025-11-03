import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  homestayServices,
  transformHomestayData,
  transformRoomData,
} from "../../api/homestays";
// import { useCart } from "../../context/useCart";
import Toast from "../../components/Toast";
import RatingModal from "../../components/RatingModal";
import RatingDisplay from "../../components/RatingDisplay";
import { ratingsService } from "../../api/ratings";
import { useAuth } from "../../context/useAuth";
// RoomTypeInfo no longer shown inline; navigating to a dedicated page instead

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Get location object to access state

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomsMessage, setRoomsMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedCheckIn] = useState(location.state?.checkIn || "");
  const [selectedCheckOut] = useState(location.state?.checkOut || "");
  const [selectedGuests] = useState(location.state?.guests || "");
  const [toast, setToast] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hotelRating, setHotelRating] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  // Cart actions not used on this page anymore
  const { isAuthenticated } = useAuth();

  // Quick booking section removed per requirements

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
        // Update local rating state
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

  // Availability check and quick booking UI removed

  // Calendar UI removed

  // Guests dropdown removed

  // Inline booking and details have been removed; navigation to a dedicated page instead

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [homestayResponse, ratingsResponse] = await Promise.all([
          homestayServices.getHomestayById(id),
          ratingsService.getHomestayRatings(id),
        ]);

        if (homestayResponse.success && homestayResponse.data) {
          const transformedHomestay = transformHomestayData(
            homestayResponse.data
          );

          let rooms = [];
          let roomsNotice = "";

          // If dates/guests provided from search, check each room type's availability
          const hasCriteria = Boolean(selectedCheckIn && selectedCheckOut);
          if (hasCriteria) {
            // First, get all room types for this hotel
            const roomsResponse = await homestayServices.fetchRoomsByHomestayId(
              id
            );

            if (roomsResponse.success && Array.isArray(roomsResponse.data)) {
              const allRoomTypes = roomsResponse.data
                .map((room) => transformRoomData(room))
                .filter(Boolean);

              // Check availability for each room type
              const roomsWithAvailability = [];

              for (const roomType of allRoomTypes) {
                // Check if this specific room type has available rooms
                const availabilityRes =
                  await homestayServices.getRoomTypeAvailability({
                    roomTypeId: roomType.id,
                    startDate: selectedCheckIn,
                    endDate: selectedCheckOut,
                  });

                if (availabilityRes.success && availabilityRes.data) {
                  const availabilityData = availabilityRes.data;
                  const availableCount =
                    availabilityData.availability_summary?.available_rooms || 0;

                  // Only include room types that have at least 1 available room
                  if (availableCount > 0) {
                    roomsWithAvailability.push(roomType);
                  }
                }
              }

              rooms = roomsWithAvailability;

              if (rooms.length === 0) {
                roomsNotice = "No rooms available for your selected dates.";
              }
            } else {
              roomsNotice = "Rooms are not available right now.";
            }
          } else {
            // Fallback: show all room types (not availability filtered)
            const roomsResponse = await homestayServices.fetchRoomsByHomestayId(
              id
            );
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
  }, [id, selectedCheckIn, selectedCheckOut, selectedGuests]);

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

          {/* Quick Booking section removed */}
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <i className="fa fa-location-dot text-green-500"></i>
              {hotel.location}
            </p>
            {(hotel.phone || hotel.email) && (
              <div className="flex items-center gap-4">
                {hotel.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <i className="fa fa-phone text-green-500"></i>
                    {hotel.phone}
                  </p>
                )}
                {hotel.email && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <i className="fa fa-envelope text-green-500"></i>
                    {hotel.email}
                  </p>
                )}
              </div>
            )}
          </div>

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

      {/* Policies Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Hotel Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hotel.cancellationPolicy && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-bold mb-2">Cancellation Policy</h4>
              <p className="text-sm text-gray-600">
                {hotel.cancellationPolicy}
              </p>
            </div>
          )}
          {hotel.childPolicy && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-bold mb-2">Child Policy</h4>
              <p className="text-sm text-gray-600">{hotel.childPolicy}</p>
            </div>
          )}
          {hotel.petPolicy && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-bold mb-2">Pet Policy</h4>
              <p className="text-sm text-gray-600">{hotel.petPolicy}</p>
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

        {/* Grouped-by-room-type view removed, restoring original flat grid */}

        {hotel.rooms && hotel.rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotel.rooms.map((room) => {
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
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/room-type/${room.id}`, {
                      state: {
                        hotelId: hotel.id,
                        hotelName: hotel.name,
                        roomName: room.name,
                        checkIn: selectedCheckIn || "",
                        checkOut: selectedCheckOut || "",
                        guests: selectedGuests || "",
                      },
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/room-type/${room.id}`, {
                        state: {
                          hotelId: hotel.id,
                          hotelName: hotel.name,
                          roomName: room.name,
                          checkIn: selectedCheckIn || "",
                          checkOut: selectedCheckOut || "",
                          guests: selectedGuests || "",
                        },
                      });
                    }
                  }}
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

                    {/* Click the card to view room type details on a dedicated page */}
                  </div>
                  {/* Book button removed as per requirements */}
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
