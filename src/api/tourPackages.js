import { API_BASE_URL } from "../config";

// Tour packages API services
export const tourPackageServices = {
  // Fetch all tour packages from API
  fetchTourPackages: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tour-packages`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching tour packages:", error);
      throw error;
    }
  },

  // Fetch tour package by ID
  fetchTourPackageById: async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/tour-packages/${id}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching tour package:", error);
      throw error;
    }
  },
};

// Helper function to transform API data to frontend format
export const transformApiDataToFrontend = (apiPackage) => {
  // Get main image and gallery images
  const mainImage = apiPackage.images?.find((img) => img.image_type === "main");
  const galleryImages =
    apiPackage.images?.filter((img) => img.image_type === "gallery") || [];

  // Create full image URLs
  const baseImageUrl = API_BASE_URL.replace("/api/v1", "");
  const mainImageUrl = mainImage
    ? `${baseImageUrl}/${mainImage.image_path}`
    : "/images/kgl.jpg";
  const imageUrls = [
    mainImageUrl,
    ...galleryImages.map((img) => `${baseImageUrl}/${img.image_path}`),
  ];

  // Parse highlights, includes, and other text fields
  const highlights = apiPackage.highlights
    ? apiPackage.highlights.split("\n").filter((h) => h.trim())
    : [];
  const includes = apiPackage.includes
    ? apiPackage.includes.split("\n").filter((i) => i.trim())
    : [];
  const whatToBring = apiPackage.what_to_bring
    ? apiPackage.what_to_bring.split("\n").filter((w) => w.trim())
    : [];

  return {
    id: apiPackage.package_id,
    title: apiPackage.name,
    description: apiPackage.description_short,
    fullDescription:
      apiPackage.description_full || apiPackage.description_short,
    duration: apiPackage.duration,
    price: parseFloat(apiPackage.price),
    currency: apiPackage.currency,
    location: apiPackage.location,
    difficulty: "Moderate", // Default since not in API
    groupSize: `${apiPackage.min_people}-${apiPackage.max_people} people`,
    mainImage: mainImageUrl,
    images: imageUrls,
    rating: 4.5, // Default rating since not in API
    reviews: Math.floor(Math.random() * 100) + 20, // Random reviews for now
    highlights:
      highlights.length > 0
        ? highlights
        : [
            "Professional guide included",
            "All entrance fees covered",
            "Transportation provided",
            "Small group experience",
          ],
    phone: apiPackage.phone,
    maxPeople: apiPackage.max_people,
    minPeople: apiPackage.min_people,
    freeCancellation: apiPackage.free_cancellation,
    reserveNowPayLater: apiPackage.reserve_now_pay_later,
    instructorLanguage: apiPackage.instructor_language,
    includes:
      includes.length > 0
        ? includes
        : [
            "Professional guide",
            "Transportation",
            "Entrance fees",
            "Bottled water",
          ],
    whatToBring:
      whatToBring.length > 0
        ? whatToBring
        : ["Comfortable walking shoes", "Camera", "Sunscreen", "Light jacket"],
    meetingPoint: apiPackage.meeting_point_details,
    thingsToKnow: apiPackage.things_to_know,
    availability: "Year round (subject to weather conditions)",
    bookingDeadline: "24 hours in advance",
    category: getCategoryFromSubcategoryId(apiPackage.subcategory_id),
    featured: apiPackage.package_id <= 2, // Mark first 2 as featured
  };
};

// Helper function to map subcategory IDs to categories
const getCategoryFromSubcategoryId = (subcategoryId) => {
  const categoryMap = {
    18: "Wildlife & Nature",
    19: "Wildlife & Nature",
    20: "Cultural & Historical",
    21: "Adventure & Water Sports",
  };
  return categoryMap[subcategoryId] || "Adventure & Water Sports";
};

// Mock data for development/testing (remove when API is ready)
export const mockTourPackages = [
  {
    id: 1,
    title: "Gorilla Trekking Adventure",
    description:
      "Experience the magic of encountering mountain gorillas in their natural habitat at Volcanoes National Park.",
    fullDescription:
      "Embark on an unforgettable journey to meet the magnificent mountain gorillas in Rwanda's Volcanoes National Park. This 3-day adventure includes guided trekking through lush bamboo forests, cultural visits to local communities, and comfortable accommodation. Our experienced guides will lead you through this once-in-a-lifetime experience while ensuring the safety of both visitors and gorillas.",
    duration: "3 days",
    price: 1200,
    currency: "USD",
    location: "Volcanoes National Park",
    difficulty: "Moderate",
    groupSize: "8 people max",
    mainImage: "/images/gisenyi.jpg",
    images: [
      "/images/gisenyi.jpg",
      "/images/msnz.jpg",
      "/images/chant.jpg",
      "/images/kvs.jpg",
      "/images/mesuim.jpg",
    ],
    rating: 4.9,
    reviews: 127,
    highlights: [
      "Gorilla trekking permit included",
      "Professional guide",
      "Transportation from Kigali",
      "Accommodation for 2 nights",
      "Cultural village visit",
      "Certificate of participation",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival and Preparation",
        activities: [
          "Pick up from Kigali (6:00 AM)",
          "Drive to Volcanoes National Park (2.5 hours)",
          "Check-in at lodge",
          "Briefing about gorilla trekking",
          "Cultural village visit",
          "Dinner and overnight",
        ],
      },
      {
        day: 2,
        title: "Gorilla Trekking Day",
        activities: [
          "Early breakfast (6:00 AM)",
          "Transfer to park headquarters",
          "Briefing by park rangers",
          "Gorilla trekking (2-6 hours)",
          "Lunch in the forest",
          "Return to lodge",
          "Relaxation and dinner",
        ],
      },
      {
        day: 3,
        title: "Departure",
        activities: [
          "Breakfast at lodge",
          "Optional golden monkey trekking",
          "Check out and departure",
          "Drive back to Kigali",
          "Drop off at hotel/airport",
        ],
      },
    ],
    inclusions: [
      "Gorilla trekking permit",
      "Accommodation (2 nights)",
      "All meals during the tour",
      "Transportation in 4WD vehicle",
      "Professional English-speaking guide",
      "Bottled water",
      "Cultural village visit",
    ],
    exclusions: [
      "International flights",
      "Rwanda visa",
      "Travel insurance",
      "Personal expenses",
      "Tips for guides and porters",
      "Alcoholic beverages",
    ],
    availability: "Year round (best: June-September, December-February)",
    bookingDeadline: "30 days in advance",
    category: "Wildlife & Nature",
    featured: true,
  },
  {
    id: 2,
    title: "Lake Kivu Island Hopping",
    description:
      "Explore the beautiful islands of Lake Kivu with boat trips, swimming, and local culture experiences.",
    fullDescription:
      "Discover the stunning beauty of Lake Kivu, one of Africa's Great Lakes, through this 2-day island hopping adventure. Visit Napoleon Island, enjoy boat rides across crystal-clear waters, experience local fishing communities, and relax on pristine beaches. This tour combines adventure, culture, and relaxation in one of Rwanda's most scenic destinations.",
    duration: "2 days",
    price: 350,
    currency: "USD",
    location: "Lake Kivu, Rubavu",
    difficulty: "Easy",
    groupSize: "12 people max",
    mainImage: "/images/kivu.jpg",
    images: [
      "/images/kivu.jpg",
      "/images/kbeach.jpg",
      "/images/pcv.jpg",
      "/images/kvb.webp",
      "/images/kvs.jpg",
    ],
    rating: 4.7,
    reviews: 89,
    highlights: [
      "Island hopping by boat",
      "Swimming in Lake Kivu",
      "Visit to Napoleon Island",
      "Local fishing community tour",
      "Lakefront accommodation",
      "Sunset boat cruise",
    ],
    itinerary: [
      {
        day: 1,
        title: "Lake Kivu Exploration",
        activities: [
          "Pick up from hotel (8:00 AM)",
          "Drive to Lake Kivu (30 minutes)",
          "Boat trip to Napoleon Island",
          "Swimming and relaxation",
          "Lunch at lakefront restaurant",
          "Visit local fishing village",
          "Check-in at lakefront lodge",
          "Sunset boat cruise",
        ],
      },
      {
        day: 2,
        title: "Island Adventures",
        activities: [
          "Early morning fishing experience",
          "Breakfast at lodge",
          "Visit to coffee plantation",
          "Island hopping tour",
          "Beach activities and lunch",
          "Return boat trip",
          "Transfer back to Kigali",
        ],
      },
    ],
    inclusions: [
      "Accommodation (1 night)",
      "All meals during tour",
      "Boat transportation",
      "Professional guide",
      "Life jackets",
      "Entrance fees",
      "Drinking water",
    ],
    exclusions: [
      "Personal expenses",
      "Travel insurance",
      "Tips for guides",
      "Alcoholic drinks",
      "Souvenirs",
    ],
    availability: "Year round",
    bookingDeadline: "7 days in advance",
    category: "Adventure & Water Sports",
    featured: false,
  },
  {
    id: 3,
    title: "Kigali City Cultural Tour",
    description:
      "Discover Rwanda's capital through its history, culture, art galleries, and local markets.",
    fullDescription:
      "Explore the vibrant capital city of Rwanda through this comprehensive cultural tour. Visit the Kigali Genocide Memorial, explore local markets, enjoy traditional Rwandan cuisine, and discover the city's growing arts scene. This full-day tour provides insight into Rwanda's history, culture, and rapid development into a modern African city.",
    duration: "1 day",
    price: 80,
    currency: "USD",
    location: "Kigali City",
    difficulty: "Easy",
    groupSize: "15 people max",
    mainImage: "/images/kgl.jpg",
    images: [
      "/images/kgl.jpg",
      "/images/mesuim.jpg",
      "/images/mriot.jpg",
      "/images/akg.jpg",
    ],
    rating: 4.5,
    reviews: 203,
    highlights: [
      "Kigali Genocide Memorial visit",
      "Local market exploration",
      "Traditional lunch",
      "Art gallery visits",
      "City viewpoints",
      "Modern Kigali districts tour",
    ],
    itinerary: [
      {
        day: 1,
        title: "Kigali Discovery",
        activities: [
          "Hotel pickup (9:00 AM)",
          "Visit Kigali Genocide Memorial",
          "Explore Kimisagara Market",
          "Traditional Rwandan lunch",
          "Visit Inema Art Center",
          "Tour of modern city districts",
          "City viewpoints photo stops",
          "Return to hotel (5:00 PM)",
        ],
      },
    ],
    inclusions: [
      "Transportation",
      "Professional guide",
      "Entrance fees",
      "Traditional lunch",
      "Bottled water",
      "City map",
    ],
    exclusions: [
      "Personal purchases",
      "Tips for guide",
      "Additional meals",
      "Souvenirs",
    ],
    availability: "Daily except Sundays",
    bookingDeadline: "1 day in advance",
    category: "Cultural & Historical",
    featured: false,
  },
  {
    id: 4,
    title: "Nyungwe Forest Canopy Walk",
    description:
      "Walk among the treetops on East Africa's first canopy walkway in the ancient Nyungwe Forest.",
    fullDescription:
      "Experience the thrill of walking 70 meters above the forest floor on East Africa's first canopy walkway. This 2-day adventure in Nyungwe National Park includes the famous canopy walk, chimpanzee tracking, waterfall hikes, and bird watching in one of Africa's oldest rainforests. Perfect for nature lovers and adventure seekers.",
    duration: "2 days",
    price: 450,
    currency: "USD",
    location: "Nyungwe National Park",
    difficulty: "Moderate",
    groupSize: "10 people max",
    mainImage: "/images/chant.jpg",
    images: [
      "/images/chant.jpg",
      "/images/mesuim.jpg",
      "/images/msnz.jpg",
      "/images/kgl.jpg",
    ],
    rating: 4.8,
    reviews: 156,
    highlights: [
      "Canopy walkway experience",
      "Chimpanzee tracking",
      "Waterfall hiking",
      "Bird watching (300+ species)",
      "Ancient rainforest exploration",
      "Tea plantation visit",
    ],
    itinerary: [
      {
        day: 1,
        title: "Forest Entry and Canopy Walk",
        activities: [
          "Early departure from Kigali (6:00 AM)",
          "Drive to Nyungwe (5 hours)",
          "Check-in at forest lodge",
          "Lunch at lodge",
          "Canopy walkway experience",
          "Nature walk in the forest",
          "Dinner and overnight",
        ],
      },
      {
        day: 2,
        title: "Chimpanzee Tracking",
        activities: [
          "Early breakfast (5:30 AM)",
          "Chimpanzee tracking",
          "Visit to waterfall",
          "Bird watching session",
          "Lunch in the forest",
          "Tea plantation visit",
          "Return drive to Kigali",
        ],
      },
    ],
    inclusions: [
      "Accommodation (1 night)",
      "All meals",
      "Transportation",
      "Park entrance fees",
      "Canopy walk permit",
      "Chimpanzee tracking permit",
      "Professional guide",
    ],
    exclusions: [
      "Travel insurance",
      "Personal expenses",
      "Tips for guides",
      "Optional activities",
    ],
    availability: "Year round (best: May-October)",
    bookingDeadline: "14 days in advance",
    category: "Wildlife & Nature",
    featured: true,
  },
  {
    id: 5,
    title: "Golden Monkey Tracking",
    description:
      "Track the rare and beautiful golden monkeys in the bamboo forests of Volcanoes National Park.",
    fullDescription:
      "Join this exciting day trip to track the endangered golden monkeys in their natural bamboo forest habitat. These playful and acrobatic primates are found only in the Virunga Mountains. The experience includes guided tracking, photography opportunities, and learning about conservation efforts to protect these beautiful creatures.",
    duration: "1 day",
    price: 120,
    currency: "USD",
    location: "Volcanoes National Park",
    difficulty: "Easy-Moderate",
    groupSize: "8 people max",
    mainImage: "/images/msnz.jpg",
    images: ["/images/msnz.jpg", "/images/gisenyi.jpg", "/images/chant.jpg"],
    rating: 4.6,
    reviews: 94,
    highlights: [
      "Golden monkey tracking permit",
      "Bamboo forest trekking",
      "Wildlife photography",
      "Conservation education",
      "Professional guide",
      "Small group experience",
    ],
    itinerary: [
      {
        day: 1,
        title: "Golden Monkey Adventure",
        activities: [
          "Early pickup from Kigali (5:30 AM)",
          "Drive to Volcanoes National Park",
          "Briefing at park headquarters",
          "Golden monkey tracking (2-4 hours)",
          "Lunch at local restaurant",
          "Optional cultural center visit",
          "Return drive to Kigali",
        ],
      },
    ],
    inclusions: [
      "Transportation",
      "Golden monkey permit",
      "Professional guide",
      "Lunch",
      "Bottled water",
      "Park entrance fees",
    ],
    exclusions: [
      "Personal expenses",
      "Tips for guides",
      "Travel insurance",
      "Optional activities",
    ],
    availability: "Daily",
    bookingDeadline: "7 days in advance",
    category: "Wildlife & Nature",
    featured: false,
  },
  {
    id: 6,
    title: "Rwanda Cultural Heritage Tour",
    description:
      "Immerse yourself in authentic Rwandan culture with traditional dance, crafts, and rural village experiences.",
    fullDescription:
      "Experience the rich cultural heritage of Rwanda through this 3-day immersive tour. Visit traditional villages, participate in local activities like banana beer brewing, learn traditional crafts, enjoy cultural performances, and stay with local families. This tour provides an authentic glimpse into Rwandan traditions and modern rural life.",
    duration: "3 days",
    price: 280,
    currency: "USD",
    location: "Various cultural sites",
    difficulty: "Easy",
    groupSize: "12 people max",
    mainImage: "/images/mesuim.jpg",
    images: [
      "/images/mesuim.jpg",
      "/images/chant.jpg",
      "/images/kgl.jpg",
      "/images/msnz.jpg",
    ],
    rating: 4.4,
    reviews: 67,
    highlights: [
      "Traditional village stay",
      "Cultural performances",
      "Traditional craft workshops",
      "Local family interactions",
      "Traditional cooking classes",
      "Cultural center visits",
    ],
    itinerary: [
      {
        day: 1,
        title: "Cultural Immersion Begin",
        activities: [
          "Departure from Kigali",
          "Visit to cultural center",
          "Traditional lunch",
          "Village welcome ceremony",
          "Traditional craft workshop",
          "Overnight with local family",
        ],
      },
      {
        day: 2,
        title: "Village Life Experience",
        activities: [
          "Participate in daily village activities",
          "Traditional cooking class",
          "Banana beer brewing",
          "Cultural dance performances",
          "Storytelling session",
          "Second night in village",
        ],
      },
      {
        day: 3,
        title: "Cultural Celebrations",
        activities: [
          "Morning cultural activities",
          "Traditional music workshop",
          "Farewell ceremony",
          "Lunch with host family",
          "Return to Kigali",
          "Cultural souvenir shopping",
        ],
      },
    ],
    inclusions: [
      "Accommodation (2 nights)",
      "All meals",
      "Transportation",
      "Cultural activities",
      "Local guide",
      "Workshop materials",
    ],
    exclusions: [
      "Personal expenses",
      "Tips for families",
      "Travel insurance",
      "Souvenirs",
    ],
    availability: "Year round",
    bookingDeadline: "10 days in advance",
    category: "Cultural & Historical",
    featured: false,
  },
];

export const getFeaturedTourPackages = () => {
  return mockTourPackages.filter((pkg) => pkg.featured);
};

export const getTourPackagesByCategory = (category) => {
  return mockTourPackages.filter((pkg) => pkg.category === category);
};
