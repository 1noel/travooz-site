import { API_AUTH_TOKEN, API_BASE_URL } from "../config";

// Homestays API Services
export const homestayServices = {
  // Fetch all homestays
  fetchHomestays: async () => {
    try {
      const response = await fetch(`https://travoozapp.com/api/homestays`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return { data: result.homestays, success: true };
    } catch (error) {
      console.error("Error fetching homestays:", error);
      return { data: [], success: false, error: error.message };
    }
  },

  // Get single homestay by ID
  getHomestayById: async (id) => {
    try {
      const response = await fetch(`https://travoozapp.com/api/homestays`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const homestay = result.homestays.find(
        (h) => h.homestay_id === parseInt(id)
      );

      if (!homestay) {
        throw new Error("Homestay not found");
      }

      return { data: homestay, success: true };
    } catch (error) {
      console.error("Error fetching homestay:", error);
      return { data: null, success: false, error: error.message };
    }
  },

  // Fetch rooms for a specific homestay
  fetchRoomsByHomestayId: async (homestayId) => {
    if (!homestayId) {
      return {
        data: [],
        success: false,
        error: "homestayId is required",
      };
    }

    try {
      const response = await fetch(`https://travoozapp.com/api/rooms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const rooms = result.data.rooms.filter(
        (room) => room.homestay_id === parseInt(homestayId)
      );
      return { data: rooms, success: true };
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return { data: [], success: false, error: error.message };
    }
  },

  checkRoomAvailability: async ({
    roomId,
    checkIn,
    checkOut,
    guests,
    token,
  }) => {
    if (!roomId) {
      throw new Error("roomId is required to check availability");
    }

    const query = new URLSearchParams();
    if (checkIn) {
      query.append("check_in_date", checkIn);
    }
    if (checkOut) {
      query.append("check_out_date", checkOut);
    }
    if (guests) {
      query.append("guests", guests);
    }

    const headers = {
      Accept: "application/json",
    };

    const resolvedToken = token || API_AUTH_TOKEN;
    if (resolvedToken) {
      headers.Authorization = `Bearer ${resolvedToken}`;
    }

    try {
      const urlQuery = query.toString();
      const endpoint = `${API_BASE_URL}/api/v1/rooms/${roomId}/availability${
        urlQuery ? `?${urlQuery}` : ""
      }`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.message || "Failed to check availability";
        throw new Error(message);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error checking room availability:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  bookRoom: async ({
    roomId,
    checkIn,
    checkOut,
    guests,
    arrivalDate,
    token,
  }) => {
    if (!roomId) {
      throw new Error("roomId is required to book a room");
    }

    const payload = {
      check_in_date: checkIn,
      check_out_date: checkOut,
      guests,
    };

    if (arrivalDate) {
      payload.arrival_date = arrivalDate;
    }

    const headers = {
      "Content-Type": "application/json",
    };

    const resolvedToken = token || API_AUTH_TOKEN;
    if (resolvedToken) {
      headers.Authorization = `Bearer ${resolvedToken}`;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/rooms/${roomId}/book`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.message || "Failed to complete booking";
        throw new Error(message);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error booking room:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

const createShortDescription = (text, maxLength = 140) => {
  if (!text) return "";
  const normalizedText = text.replace(/\s+/g, " ").trim();
  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  const truncated = normalizedText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const safeCut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  return `${safeCut.trim()}…`;
};

const normalizeCurrencyCode = (currency) => {
  if (!currency) return "RWF";

  const normalized = currency.toString().trim().toUpperCase();

  if (["RF", "RFW", "FRW", "RW", "RWF"].includes(normalized)) {
    return "RWF";
  }

  return normalized;
};

const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const normalizeStatusLabel = (status) => {
  if (!status) return null;

  const normalized = status.toString().trim();
  if (!normalized) return null;

  return toTitleCase(normalized.replace(/[._-]+/g, " "));
};

// Transform homestay data for frontend use
export const transformHomestayData = (homestay) => {
  if (!homestay) return null;

  // Since the new API doesn't provide images, we'll use a placeholder.
  const mainImage = "/images/radsn.jpg"; // Using an existing image as placeholder
  const images = []; // No images from the new API

  // Determine category based on subcategory_id
  const getHomestayCategory = (subcategoryId) => {
    const categoryMap = {
      11: "Hotels",
      12: "Motels",
      13: "Homestays",
      // Add more mappings if you know other subcategory IDs
    };
    return categoryMap[subcategoryId] || "Accommodation";
  };

  const transformedData = {
    id: homestay.homestay_id,
    vendorId: homestay.vendor_id,
    name: homestay.name,
    description: homestay.description,
    shortDescription: createShortDescription(homestay.description),
    location: homestay.address || "Location not specified", // Use address and provide fallback
    mainImage,
    images: images,
    stars: homestay.star_rating,
    category: getHomestayCategory(homestay.subcategory_id),
    cancellationPolicy: homestay.cancellation_policy,
    childPolicy: homestay.child_policy,
    petPolicy: homestay.pet_policy,
    email: homestay.email,
    features: {
      freeWifi: homestay.free_wifi,
      parking: homestay.parking_available,
      petFriendly: homestay.pet_friendly,
      swimmingPool: homestay.swimming_pool,
      spa: homestay.spa,
      fitnessCenter: homestay.fitness_center,
      restaurant: homestay.restaurant,
      barLounge: homestay.bar_lounge,
      airConditioning: homestay.air_conditioning,
      roomService: homestay.room_service,
      laundryService: homestay.laundry_service,
      airportShuttle: homestay.airport_shuttle,
      familyRooms: homestay.family_rooms,
      nonSmokingRooms: homestay.non_smoking_rooms,
      breakfastIncluded: homestay.breakfast_included,
      kitchenFacilities: homestay.kitchen_facilities,
      balcony: homestay.balcony,
      oceanView: homestay.ocean_view,
      gardenView: homestay.garden_view,
      wheelchairAccessible: homestay.wheelchair_accessible,
      meetingRooms: homestay.meeting_rooms,
      conferenceFacilities: homestay.conference_facilities,
      security24h: homestay.security_24h,
    },
    featured: homestay.featured,
    freshDiscoveries: homestay.fresh_discoveries,
    status: homestay.status,
    slug: homestay.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  };

  // Only add phone if it exists in the API response
  if (homestay.phone) {
    transformedData.phone = homestay.phone;
  }

  return transformedData;
};

export const transformRoomData = (room) => {
  if (!room) return null;

  // No images from the new API, so we use placeholders
  const mainImage = "/images/rm1.jpg"; // Using an existing room image as placeholder

  const priceValue = room.price_per_night;
  const normalizedStatus = normalizeStatusLabel(room.status);

  const transformedRoom = {
    id: room.room_id,
    name: room.room_type_name || `Room ${room.room_number}`,
    description: room.room_type_description || "",
    shortDescription: createShortDescription(room.room_type_description || ""),
    price: priceValue !== undefined ? parseFloat(priceValue) : null,
    currency: normalizeCurrencyCode(room.currency),
    capacity: room.max_people,
    amenities: [], // No amenities data in the new API
    mainImage,
    image: mainImage,
    images: [],
    rawImages: [],
    status: normalizedStatus,
    statusRaw: room.status,
    size: room.size_sqm,
  };

  return transformedRoom;
};

export default homestayServices;
