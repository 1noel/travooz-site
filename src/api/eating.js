import { API_BASE_URL } from "../config";

// Eating places API services
export const eatingPlaceServices = {
  // Fetch all eating places from API
  fetchEatingPlaces: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/eating-out`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching eating places:", error);
      throw error;
    }
  },

  // Fetch eating place by ID
  fetchEatingPlaceById: async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/eating-out/${id}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching eating place:", error);
      throw error;
    }
  },
};

// Helper function to transform API data to frontend format
export const transformApiDataToFrontend = (apiEatingPlace) => {
  // Create full image URL
  const baseImageUrl = API_BASE_URL.replace("/api/v1", "");
  const mainImageUrl = apiEatingPlace.main_image
    ? `${baseImageUrl}${apiEatingPlace.main_image}`
    : "/src/assets/images/menu.jpg";

  // Generate additional placeholder images for gallery
  const placeholderImages = [
    "/src/assets/images/menu.jpg",
    "/src/assets/images/restu.jpg",
    "/images/radsn.jpg",
    "/images/rm1.jpg",
    "/images/rm2.jpg"
  ];

  return {
    id: apiEatingPlace.eating_out_id,
    name: apiEatingPlace.name,
    location: apiEatingPlace.location,
    price: Math.floor(Math.random() * 30) + 10, // Random price since not in API
    image: mainImageUrl,
    images: [mainImageUrl, ...placeholderImages.slice(0, 4)],
    stars: apiEatingPlace.average_rating || Math.floor(Math.random() * 2) + 4, // Use API rating or random 4-5
    views: Math.floor(Math.random() * 1000) + 200, // Random views since not in API
    description: apiEatingPlace.description,
    cuisine: getCuisineFromSubcategory(apiEatingPlace.subcategory_name),
    category: apiEatingPlace.subcategory_name,
    phone: apiEatingPlace.phone,
    parking: apiEatingPlace.parking_available,
    wifi: apiEatingPlace.wifi_available,
    delivery: apiEatingPlace.delivery_support,
    vendor: apiEatingPlace.vendor_name,
    totalTables: apiEatingPlace.total_tables,
    availableTables: apiEatingPlace.available_tables,
    menuItemsCount: apiEatingPlace.menu_items_count,
    totalReviews: apiEatingPlace.total_reviews,
    status: apiEatingPlace.status,
    createdAt: apiEatingPlace.created_at,
    updatedAt: apiEatingPlace.updated_at
  };
};

// Helper function to map subcategory names to cuisine types
const getCuisineFromSubcategory = (subcategoryName) => {
  const cuisineMap = {
    "Local Restaurants": "Rwandan",
    "Street Food": "Street Food",
    "Cafes & Bakeries": "Continental",
    "Fine Dining": "International",
    "Fast Food": "Fast Food"
  };
  return cuisineMap[subcategoryName] || "International";
};

// Mock data for development/testing (keep for fallback)
export const mockEatingPlaces = [
    {
        id: 1, 
        name: "Ubuntu Restaurant", 
        location: "Kigali, Rwanda", 
        price: 25, 
        image: "/src/assets/images/menu.jpg",
        images: [
            "/src/assets/images/menu.jpg",
            "/src/assets/images/restu.jpg",
            "/images/radsn.jpg",
            "/images/rm1.jpg",
            "/images/rm2.jpg"
        ],
        stars: 5, 
        views: 1250, 
        description: "Premium restaurant offering authentic Rwandan cuisine with a modern twist. Experience traditional flavors in an elegant atmosphere with exceptional service.",
        cuisine: "Rwandan",
        category: "Fine Dining"
    },
    {
        id: 2, 
        name: "Heaven Restaurant", 
        location: "Kigali, Rwanda",
        price: 18,
        image: "/src/assets/images/restu.jpg",
        images: [
            "/src/assets/images/restu.jpg",
            "/src/assets/images/menu.jpg",
            "/images/ubmw.jpg",
            "/images/kgl.jpg",
            "/images/pcv.jpg"
        ],
        stars: 4,
        views: 980,
        description: "A top-rated restaurant offering a blend of local and international cuisines in a vibrant atmosphere. Known for its excellent service and diverse menu.",
        cuisine: "International",
        category: "Casual Dining"
    },
    {
        id: 3, 
        name: "Kigali Café", 
        location: "Kigali, Rwanda",
        price: 12,
        image: "/src/assets/images/menu.jpg",
        stars: 4,
        views: 650,
        description: "Cozy café perfect for breakfast and light meals. Featuring fresh coffee, pastries, and a relaxed atmosphere ideal for meetings or casual dining.",
        cuisine: "Continental",
        category: "Café"
    },
    {
        id: 4, 
        name: "Spice Garden", 
        location: "Kigali, Rwanda",
        price: 22,
        image: "/src/assets/images/restu.jpg",
        stars: 4,
        views: 890,
        description: "Authentic Indian restaurant offering aromatic spices and traditional dishes. Experience the rich flavors of India in the heart of Kigali.",
        cuisine: "Indian",
        category: "Fine Dining"
    },
    {
        id: 5, 
        name: "Fast Bite", 
        location: "Kigali, Rwanda",
        price: 8,
        image: "/src/assets/images/menu.jpg",
        stars: 3,
        views: 420,
        description: "Quick service restaurant offering fast food options and local favorites. Perfect for a quick meal on the go.",
        cuisine: "Fast Food",
        category: "Fast Food"
    },
    {
        id: 6, 
        name: "Lake View Grill", 
        location: "Rubavu, Rwanda",
        price: 28,
        image: "/src/assets/images/restu.jpg",
        stars: 5,
        views: 1100,
        description: "Elegant lakeside restaurant with stunning views of Lake Kivu. Specializing in grilled meats and fresh fish with international flair.",
        cuisine: "Grill & Seafood",
        category: "Fine Dining"
    }
]

// Helper functions for mock data (use these if API is not ready)
export const getEatingPlaceById = (id) => {
    return mockEatingPlaces.find(place => place.id === parseInt(id))
}

export const getAllEatingPlaces = () => {
    return mockEatingPlaces
}

// New functions for API integration
export const getEatingPlacesByCategory = (category) => {
    return mockEatingPlaces.filter(place => place.category === category)
}

export const getEatingPlacesByCuisine = (cuisine) => {
    return mockEatingPlaces.filter(place => place.cuisine === cuisine)
}