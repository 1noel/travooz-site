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

  // Fetch room types for a specific homestay (new API structure)
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
      // Use room_types array and filter by homestay_id
      const roomTypes = (result.data.room_types || []).filter(
        (roomType) => roomType.homestay_id === parseInt(homestayId)
      );
      return { data: roomTypes, success: true };
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

  // Fetch room type availability details (per-room-type)
  getRoomTypeAvailability: async ({ roomTypeId, startDate, endDate }) => {
    if (!roomTypeId) {
      return { success: false, error: "roomTypeId is required" };
    }
    if (!startDate || !endDate) {
      return { success: false, error: "startDate and endDate are required" };
    }

    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
      const endpoint = `https://travoozapp.com/api/room-availability/room/${roomTypeId}?${params.toString()}`;
      const res = await fetch(endpoint);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          json?.message || "Failed to fetch room type availability";
        throw new Error(message);
      }
      return { success: true, data: json?.data ?? json };
    } catch (error) {
      console.error("Error fetching room type availability:", error);
      return { success: false, error: error.message };
    }
  },

  // Search available hotels for a date range and optional location/guests
  searchAvailableHotels: async ({ locationId, startDate, endDate, guests }) => {
    try {
      // If we don't have a locationId yet, fall back to general homestays list
      if (!locationId) {
        const fallback = await homestayServices.fetchHomestays();
        if (fallback.success) {
          return { success: true, data: fallback.data };
        }
        return {
          success: false,
          error: fallback.error || "Failed to load hotels",
          data: [],
        };
      }

      const params = new URLSearchParams();
      if (locationId) params.append("location_id", String(locationId));
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (guests) params.append("guests", String(guests));

      const endpoint = `https://travoozapp.com/api/room-availability/available-hotels?${params.toString()}`;
      const res = await fetch(endpoint);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const message = json?.message || "Failed to fetch available hotels";
        // Graceful fallback when backend requires location_id
        if (/location id is required/i.test(message)) {
          const fb = await homestayServices.fetchHomestays();
          if (fb.success) {
            return { success: true, data: fb.data };
          }
        }
        throw new Error(message);
      }
      // Some endpoints return {success, data}, others direct; normalize
      const payload = json?.data?.hotels ?? json?.data ?? json;
      const hotels = Array.isArray(payload?.hotels)
        ? payload.hotels
        : Array.isArray(payload)
        ? payload
        : [];
      return { success: true, data: hotels };
    } catch (error) {
      console.error("Error fetching available hotels:", error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get available rooms for a given homestay and date range
  searchAvailableRooms: async ({
    homestayId,
    startDate,
    endDate,
    guests,
    roomTypeId,
  }) => {
    try {
      const params = new URLSearchParams();
      if (homestayId) params.append("homestay_id", String(homestayId));
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (guests) params.append("guests", String(guests));
      if (roomTypeId && roomTypeId !== "all")
        params.append("room_type_id", String(roomTypeId));

      const endpoint = `https://travoozapp.com/api/room-availability/available-rooms?${params.toString()}`;
      const res = await fetch(endpoint);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const message = json?.message || "Failed to fetch available rooms";
        throw new Error(message);
      }
      const payload = json?.data?.available_rooms ?? json?.data ?? json;
      const rooms = Array.isArray(payload) ? payload : [];
      return { success: true, data: rooms };
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      return { success: false, error: error.message, data: [] };
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

// Transform a hotel item from available-hotels endpoint to the frontend shape
export const transformAvailableHotel = (hotel) => {
  if (!hotel) return null;

  const images = Array.isArray(hotel.images)
    ? hotel.images
        .map((img) =>
          img?.image_path ? `https://travoozapp.com/${img.image_path}` : null
        )
        .filter(Boolean)
    : [];
  const mainImage = images[0] || "/images/radsn.jpg";

  const features = {
    freeWifi: Boolean(hotel.free_wifi),
    parking: Boolean(hotel.parking_available),
    swimmingPool: Boolean(hotel.swimming_pool),
    restaurant: Boolean(hotel.restaurant),
    breakfastIncluded: Boolean(hotel.breakfast_included),
  };

  const shortDescription = createShortDescription(hotel.description, 160);

  return {
    id: hotel.homestay_id,
    vendorId: hotel.vendor_id,
    name: hotel.homestay_name || hotel.name,
    description: hotel.description || "",
    shortDescription,
    location: hotel.location_name || hotel.address || "",
    mainImage,
    images,
    stars: hotel.star_rating,
    features,
    priceFrom: hotel.price_from ? parseFloat(hotel.price_from) : null,
    currency: "RWF",
    availableRoomsCount: hotel.available_rooms_count,
    maxOccupancy: hotel.max_occupancy,
    phone: hotel.phone || "",
    slug: (hotel.homestay_name || hotel.name || "hotel")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  };
};

// Transform available-rooms items to our room card shape
export const transformAvailableRoom = (item) => {
  if (!item) return null;

  // Try to derive images
  const images = Array.isArray(item.images)
    ? item.images
        .map((img) =>
          img?.image_path ? `https://travoozapp.com/${img.image_path}` : null
        )
        .filter(Boolean)
    : [];
  const mainImage = images[0] || "/images/rm1.jpg";

  // Normalize likely fields
  const id =
    item.room_type_id ||
    item.id ||
    item.inventory_id ||
    Math.random().toString(36).slice(2);
  const name = item.room_type || item.name || "Room";
  const price =
    item.base_price != null
      ? parseFloat(item.base_price)
      : item.price != null
      ? parseFloat(item.price)
      : null;
  const currency = normalizeCurrencyCode(item.currency || "RWF");
  const capacity = item.max_occupancy || item.capacity;
  const size = item.size_sqm || item.size;

  return {
    id,
    name,
    description: item.description || "",
    shortDescription: createShortDescription(item.description || ""),
    price,
    currency,
    capacity,
    size,
    mainImage,
    image: mainImage,
    images,
    status: "available",
    homestayId: item.homestay_id,
    homestayName: item.homestay_name,
  };
};

// Group available rooms by room type with counts and room numbers
export const transformAvailableRoomsGrouped = (items) => {
  const list = Array.isArray(items) ? items : [];
  const map = new Map();

  for (const it of list) {
    const rtId = it?.room_type_id || it?.roomTypeId || it?.room_type?.id;
    const key = rtId != null ? String(rtId) : `unknown-${it?.room_type || ""}`;
    const name =
      it?.room_type || it?.roomTypeName || it?.room_type_name || "Room";
    const roomNumber = it?.room_number ?? it?.roomNumber ?? null;
    const inventoryId = it?.inventory_id ?? it?.id ?? null;
    const price =
      it?.base_price != null
        ? parseFloat(it.base_price)
        : it?.price != null
        ? parseFloat(it.price)
        : null;
    const currency = normalizeCurrencyCode(it?.currency || "RWF");
    const capacity = it?.max_occupancy ?? it?.capacity ?? null;
    const size = it?.size_sqm ?? it?.size ?? null;

    const images = Array.isArray(it?.images)
      ? it.images
          .map((img) =>
            img?.image_path ? `https://travoozapp.com/${img.image_path}` : null
          )
          .filter(Boolean)
      : [];

    if (!map.has(key)) {
      map.set(key, {
        roomTypeId: rtId ?? key,
        roomTypeName: name,
        basePrice: price,
        currency,
        capacity,
        size,
        images,
        mainImage: images[0] || "/images/rm1.jpg",
        availableRooms: [],
        availableCount: 0,
      });
    }

    const group = map.get(key);
    if (inventoryId || roomNumber) {
      group.availableRooms.push({ inventoryId, roomNumber });
    }
    group.availableCount = group.availableRooms.length;
    // Prefer the lowest price as basePrice
    if (price != null) {
      if (group.basePrice == null || price < group.basePrice) {
        group.basePrice = price;
      }
    }
  }

  return Array.from(map.values());
};

export const transformRoomData = (roomType) => {
  if (!roomType) return null;

  // Build image URLs from images array (if present)
  const images = Array.isArray(roomType.images)
    ? roomType.images
        .map((img) =>
          img.image_path ? `https://travoozapp.com/${img.image_path}` : null
        )
        .filter(Boolean)
    : [];
  const mainImage = images[0] || "/images/rm1.jpg";

  return {
    id: roomType.room_type_id,
    name: roomType.room_type || `Room Type ${roomType.room_type_id}`,
    description: roomType.description || "",
    shortDescription: createShortDescription(roomType.description || ""),
    price:
      roomType.base_price !== undefined
        ? parseFloat(roomType.base_price)
        : null,
    currency: normalizeCurrencyCode(roomType.currency),
    capacity: roomType.max_occupancy,
    size: roomType.size_sqm,
    mainImage,
    image: mainImage,
    images,
    rawImages: images,
    status: null, // No status in new API for room type
    statusRaw: null,
    totalItems: roomType.total_items,
    availableCount: roomType.available_count,
    occupiedCount: roomType.occupied_count,
    reservedCount: roomType.reserved_count,
    maintenanceCount: roomType.maintenance_count,
    outOfOrderCount: roomType.out_of_order_count,
    cleaningCount: roomType.cleaning_count,
    homestayId: roomType.homestay_id,
    homestayName: roomType.homestay_name,
  };
};

export default homestayServices;
