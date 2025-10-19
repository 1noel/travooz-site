import { API_BASE_URL } from "../config";

/**
 * Rating API Service
 * Handles rating submissions and fetching for homestays and restaurants
 */

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  try {
    const session = localStorage.getItem("travooz-auth-session");
    if (session) {
      const { token } = JSON.parse(session);
      return token;
    }
  } catch (error) {
    console.error("Error reading auth token:", error);
  }
  return null;
};

// Helper function to build headers with auth token
const buildHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const ratingsService = {
  /**
   * Submit a rating for a homestay
   * @param {Object} ratingData - { homestayId, rating, comment }
   * @returns {Promise<Object>}
   */
  async submitHomestayRating(ratingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/homestays/rate`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          homestay_id: ratingData.homestayId,
          rating: ratingData.rating,
          comment: ratingData.comment || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit rating");
      }

      return {
        success: true,
        data: data.data || data,
        message: "Rating submitted successfully",
      };
    } catch (error) {
      console.error("Error submitting homestay rating:", error);
      return {
        success: false,
        error: error.message || "Failed to submit rating",
      };
    }
  },

  /**
   * Submit a rating for a restaurant/eating place
   * @param {Object} ratingData - { eatingPlaceId, rating, comment }
   * @returns {Promise<Object>}
   */
  async submitRestaurantRating(ratingData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/eating-places/rate`,
        {
          method: "POST",
          headers: buildHeaders(),
          body: JSON.stringify({
            eating_place_id: ratingData.eatingPlaceId,
            rating: ratingData.rating,
            comment: ratingData.comment || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit rating");
      }

      return {
        success: true,
        data: data.data || data,
        message: "Rating submitted successfully",
      };
    } catch (error) {
      console.error("Error submitting restaurant rating:", error);
      return {
        success: false,
        error: error.message || "Failed to submit rating",
      };
    }
  },

  /**
   * Get ratings for a specific homestay
   * @param {string|number} homestayId
   * @returns {Promise<Object>}
   */
  async getHomestayRatings(homestayId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/homestays/${homestayId}/ratings`,
        {
          method: "GET",
          headers: buildHeaders(),
        }
      );

      // Gracefully handle 401 Unauthorized without throwing an error
      if (response.status === 401) {
        console.warn(
          "Unauthorized: Cannot fetch ratings without authentication."
        );
        return {
          success: false,
          error: "Unauthorized",
          data: { ratings: [], averageRating: 0, totalReviews: 0 },
        };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch ratings");
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error("Error fetching homestay ratings:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch ratings",
        data: { ratings: [], averageRating: 0, totalReviews: 0 },
      };
    }
  },

  /**
   * Get ratings for a specific restaurant
   * @param {string|number} eatingPlaceId
   * @returns {Promise<Object>}
   */
  async getRestaurantRatings(eatingPlaceId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/eating-places/${eatingPlaceId}/ratings`,
        {
          method: "GET",
          headers: buildHeaders(),
        }
      );

      // Gracefully handle 401 Unauthorized
      if (response.status === 401) {
        console.warn(
          "Unauthorized: Cannot fetch ratings without authentication."
        );
        return {
          success: false,
          error: "Unauthorized",
          data: { ratings: [], averageRating: 0, totalReviews: 0 },
        };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch ratings");
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error("Error fetching restaurant ratings:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch ratings",
        data: { ratings: [], averageRating: 0, totalReviews: 0 },
      };
    }
  },
};

export default ratingsService;
