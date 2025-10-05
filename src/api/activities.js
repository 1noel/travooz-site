import { API_BASE_URL } from "../config";

export const activityServices = {
  fetchActivities: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/activities`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },

  fetchActivityById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/activities/${id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching activity details:", error);
      return null;
    }
  },
};

// Transform activity data to match frontend expectations
export const transformActivityToFrontend = (activity) => {
  if (!activity) return null;

  // Transform images to include full URLs using original image_path from API
  const transformedImages =
    activity.images?.map((img) => ({
      ...img,
      url: `${API_BASE_URL}/${img.image_path}`,
    })) || [];

  // Find main image from images array
  const mainImage =
    transformedImages.find((img) => img.image_type === "main")?.url ||
    transformedImages[0]?.url ||
    "/images/kgl.jpg";

  // Get gallery images (excluding main)
  const galleryImages = transformedImages
    .filter((img) => img.image_type === "gallery")
    .sort((a, b) => a.image_order - b.image_order)
    .map((img) => img.url);

  return {
    id: activity.activity_id,
    name: activity.name,
    description: activity.description,
    location: activity.location,
    phone: activity.phone,
    price: parseFloat(activity.base_price),
    capacity: activity.capacity,
    schedule: activity.schedule,
    vendor: activity.vendor,
    vendorName: activity.vendor_name,
    subcategory: activity.subcategory_name,
    category: activity.category_name,
    mainImage: mainImage,
    galleryImages: galleryImages,
    allImages: transformedImages,
    status: activity.status,
    createdAt: activity.created_at,
    updatedAt: activity.updated_at,
  };
};

// Activity category mapping for filtering/organization
export const ACTIVITY_CATEGORIES = {
  "Adventure Sports": "adventure",
  "Cultural Tours": "cultural",
  "Nature & Wildlife": "nature",
  "Water Activities": "water",
  "City Tours": "city",
  "Food & Dining": "food",
  Entertainment: "entertainment",
  Other: "other",
};

// Get unique locations from activities
export const getUniqueLocations = (activities) => {
  if (!Array.isArray(activities)) return [];

  const locations = activities
    .map((activity) => activity.location)
    .filter((location) => location && location.trim() !== "");

  return [...new Set(locations)].sort();
};

// Filter activities by various criteria
export const filterActivities = (activities, filters = {}) => {
  if (!Array.isArray(activities)) return [];

  return activities.filter((activity) => {
    // Filter by location
    if (filters.location && activity.location !== filters.location) {
      return false;
    }

    // Filter by price range
    if (filters.minPrice && activity.base_price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && activity.base_price > filters.maxPrice) {
      return false;
    }

    // Filter by category/subcategory
    if (filters.category && activity.category_name !== filters.category) {
      return false;
    }
    if (
      filters.subcategory &&
      activity.subcategory_name !== filters.subcategory
    ) {
      return false;
    }

    // Search by name or description
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const nameMatch = activity.name.toLowerCase().includes(searchTerm);
      const descMatch = activity.description.toLowerCase().includes(searchTerm);
      if (!nameMatch && !descMatch) {
        return false;
      }
    }

    return true;
  });
};
