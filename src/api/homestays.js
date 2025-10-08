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
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rooms?homestay_id=${homestayId}`);
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

// Transform room data for frontend use
export const transformRoomData = (room) => {
  if (!room) return null;

  // Transform room images
  const images = room.images
    ? room.images
        .sort((a, b) => a.image_order - b.image_order)
        .map((img) => ({
          id: img.image_id,
          url: `${API_BASE_URL}/${img.image_path}`,
          order: img.image_order,
        }))
    : [];

  // Get main image (first image)
  const mainImage = images.length > 0 ? images[0].url : "/images/default-room.jpg";

  // Transform amenities (filter only available ones)
  const amenities = [];
  const amenityLabels = {
    minibar: "Minibar",
    tea_coffee_facilities: "Tea & Coffee",
    wardrobe_hangers: "Wardrobe",
    luggage_rack: "Luggage Rack",
    safe: "Safe",
    air_conditioner: "AC",
    heater: "Heater",
    fan: "Fan",
    wifi: "WiFi",
    tv: "TV",
    speaker: "Speaker",
    phone: "Phone",
    usb_charging_points: "USB Charging",
    power_adapters: "Power Adapters",
    desk_workspace: "Desk",
    iron_ironing_board: "Iron & Board",
    hairdryer: "Hair Dryer",
    towels: "Towels",
    bathrobes: "Bathrobes",
    slippers: "Slippers",
    toiletries: "Toiletries",
    teeth_shaving_kits: "Shaving Kits",
    table_lamps: "Table Lamps",
    bedside_lamps: "Bedside Lamps",
    alarm_clock: "Alarm Clock",
    laundry_bag: "Laundry Bag"
  };

  // Add available amenities
  Object.keys(amenityLabels).forEach(key => {
    if (room[key] === 1 || (room.amenities && room.amenities[key] === 1)) {
      amenities.push(amenityLabels[key]);
    }
  });

  return {
    id: room.room_id,
    homestayId: room.homestay_id,
    name: room.name,
    description: room.description,
    price: parseFloat(room.price),
    maxPeople: room.max_people,
    discount: parseFloat(room.discount || 0),
    included: room.included ? room.included.split(', ') : [],
    status: room.status,
    mainImage,
    images: images.map(img => img.url),
    amenities,
    createdAt: room.created_at,
    updatedAt: room.updated_at
  };
};

export default homestayServices;
