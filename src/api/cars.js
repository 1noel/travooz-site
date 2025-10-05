import { API_BASE_URL } from "../config";

// Car API Services
export const carServices = {
  // Fetch all cars
  fetchCars: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/cars`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cars = await response.json();
      return { data: cars, success: true };
    } catch (error) {
      console.error("Error fetching cars:", error);
      return { data: [], success: false, error: error.message };
    }
  },

  // Get single car by ID
  getCarById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/cars`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cars = await response.json();
      const car = cars.find((c) => c.car_id === parseInt(id));

      if (!car) {
        throw new Error("Car not found");
      }

      return { data: car, success: true };
    } catch (error) {
      console.error("Error fetching car:", error);
      return { data: null, success: false, error: error.message };
    }
  },
};

// Transform car data for frontend use
export const transformCarData = (car) => {
  if (!car) return null;

  // Get the main image (first image or ordered image)
  const mainImage =
    car.images && car.images.length > 0
      ? `${API_BASE_URL}${car.images[0].image_path}`
      : "/images/default-car.jpg";

  // Transform all images
  const images = car.images
    ? car.images
        .sort((a, b) => a.image_order - b.image_order)
        .map((img) => ({
          id: img.image_id,
          url: `${API_BASE_URL}${img.image_path}`,
          order: img.image_order,
        }))
    : [];

  // Parse features if it's a JSON string
  let features = {};
  if (car.features) {
    try {
      features =
        typeof car.features === "string"
          ? JSON.parse(car.features)
          : car.features;
    } catch (error) {
      console.warn("Failed to parse car features:", error);
      features = {};
    }
  }

  // Format rates
  const dailyRate = parseFloat(car.daily_rate) || 0;
  const weeklyRate = parseFloat(car.weekly_rate) || 0;
  const monthlyRate = parseFloat(car.monthly_rate) || 0;

  // Determine category based on subcategory_id or car type
  const getCarCategory = (subcategoryId, brand, model) => {
    const categoryMap = {
      14: "SUV & Van",
      15: "Economy",
      16: "Luxury",
      17: "Premium",
    };

    // Fallback based on model keywords
    const modelLower = (model || "").toLowerCase();
    const brandLower = (brand || "").toLowerCase();

    if (modelLower.includes("van") || modelLower.includes("bus"))
      return "SUV & Van";
    if (
      modelLower.includes("sport") ||
      modelLower.includes("luxury") ||
      brandLower.includes("lexus") ||
      brandLower.includes("acura")
    )
      return "Luxury";
    if (modelLower.includes("pick") || modelLower.includes("truck"))
      return "Utility";

    return categoryMap[subcategoryId] || "Economy";
  };

  return {
    id: car.car_id,
    vendorId: car.vendor_id,
    brand: car.brand,
    model: car.model,
    year: car.year,
    licensePlate: car.license_plate,
    color: car.color,
    seatCapacity: car.seat_capacity,
    transmission: car.transmission,
    fuelType: car.fuel_type,
    location: car.location,
    description: car.description,
    features: features,
    mainImage,
    images,
    rates: {
      daily: dailyRate,
      weekly: weeklyRate,
      monthly: monthlyRate,
    },
    category: getCarCategory(car.subcategory_id, car.brand, car.model),
    isAvailable: car.is_available !== false, // Default to true if not specified
    mileage: car.mileage,
    securityDeposit: car.security_deposit,
    slug: `${car.brand}-${car.model}-${car.year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  };
};

// Get car availability status
export const getAvailabilityStatus = (car) => {
  if (car.isAvailable === false) return { status: "unavailable", color: "red" };
  if (car.isAvailable === true) return { status: "available", color: "green" };
  return { status: "contact", color: "yellow" };
};

// Format price display
export const formatPrice = (price, currency = "USD") => {
  if (!price || price === 0) return "Contact for Price";

  const formattedPrice = new Intl.NumberFormat().format(price);

  if (currency === "USD") {
    return `$${formattedPrice}`;
  } else if (currency === "RWF") {
    return `${formattedPrice} RWF`;
  }

  return `$${formattedPrice}`;
};

export default carServices;
