import { API_BASE_URL } from "../config";

// Homestays API Services
export const homestayServices = {
  // Fetch all homestays
  fetchHomestays: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/homestays`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const homestays = await response.json();
      return { data: homestays, success: true };
    } catch (error) {
      console.error("Error fetching homestays:", error);
      return { data: [], success: false, error: error.message };
    }
  },

  // Get single homestay by ID
  getHomestayById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/homestays`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const homestays = await response.json();
      const homestay = homestays.find((h) => h.homestay_id === parseInt(id));

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
      const response = await fetch(
        `${API_BASE_URL}/api/v1/rooms?homestay_id=${homestayId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rooms = await response.json();
      return { data: rooms, success: true };
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return { data: [], success: false, error: error.message };
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

const normalizeAmenities = (amenities) => {
  if (!amenities) return [];

  if (Array.isArray(amenities)) {
    return amenities
      .map((amenity) => {
        if (typeof amenity === "string") {
          return amenity.trim();
        }
        if (amenity && typeof amenity === "object") {
          if (amenity.label) return amenity.label.toString().trim();
          if (amenity.name) return amenity.name.toString().trim();
        }
        return null;
      })
      .filter(Boolean);
  }

  if (typeof amenities === "string") {
    return amenities
      .split(/[;,|•]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof amenities === "object") {
    return Object.entries(amenities)
      .filter(([, value]) => value === true || value === 1)
      .map(([key]) =>
        toTitleCase(
          key
            .toString()
            .replace(/([A-Z])/g, " $1")
            .replace(/[._-]+/g, " ")
            .trim()
        )
      )
      .filter(Boolean);
  }

  return [];
};

// Transform homestay data for frontend use
export const transformHomestayData = (homestay) => {
  if (!homestay) return null;

  // Get the main image (first image or ordered image)
  const mainImage =
    homestay.images && homestay.images.length > 0
      ? `${API_BASE_URL}/${homestay.images[0].image_path}`
      : "/images/default-hotel.jpg";

  // Transform all images
  const images = homestay.images
    ? homestay.images
        .sort((a, b) => a.image_order - b.image_order)
        .map((img) => ({
          id: img.image_id,
          url: `${API_BASE_URL}/${img.image_path}`,
          order: img.image_order,
        }))
    : [];

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
    location: homestay.location,
    mainImage,
    images: images.map((img) => img.url),
    category: getHomestayCategory(homestay.subcategory_id),
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

  const images = room.images
    ? [...room.images]
        .sort((a, b) => (a.image_order ?? 0) - (b.image_order ?? 0))
        .map((img) => ({
          id: img.image_id ?? img.id,
          url: `${API_BASE_URL}/${img.image_path}`,
          order: img.image_order ?? 0,
        }))
    : [];

  const mainImage = images[0]?.url || "/images/default-room.jpg";

  const priceValue = room.price ?? room.price_per_night ?? room.base_price;

  const normalizedAmenities = normalizeAmenities(room.amenities);
  const normalizedStatus = normalizeStatusLabel(room.status ?? room.status_label);

  const transformedRoom = {
    id: room.room_id ?? room.id,
    name: room.name ?? "Room",
    description: room.description ?? "",
    shortDescription: createShortDescription(room.description ?? ""),
    price: priceValue !== undefined ? parseFloat(priceValue) : null,
  currency: normalizeCurrencyCode(room.currency),
    capacity: room.capacity ?? room.max_guests ?? null,
    amenities: normalizedAmenities,
    mainImage,
    image: mainImage,
    images: images.map((img) => img.url),
    rawImages: images,
    status: normalizedStatus,
    statusRaw: room.status ?? room.status_label ?? null,
  };

  if (room.size) {
    transformedRoom.size = room.size;
  }

  if (room.beds) {
    transformedRoom.beds = room.beds;
  }

  if (room.status) {
    transformedRoom.status = room.status;
  }

  return transformedRoom;
};

export default homestayServices;
