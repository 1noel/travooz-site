import { API_BASE_URL } from "../config";

export const locationServices = {
  fetchLocations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/locations`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching locations:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch locations",
      };
    }
  },
};

// Helper function to get location name by ID
export const getLocationById = async (locationId) => {
  try {
    const response = await locationServices.fetchLocations();
    if (response.success && response.data) {
      const location = response.data.find(
        (loc) => loc.location_id === locationId
      );
      return location ? location.location_name : null;
    }
    return null;
  } catch (error) {
    console.error("Error getting location by ID:", error);
    return null;
  }
};
