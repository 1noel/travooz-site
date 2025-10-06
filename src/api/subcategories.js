import { API_BASE_URL } from "../config";

export const subcategoryServices = {
  fetchSubcategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/subcategories`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch subcategories",
      };
    }
  },

  fetchSubcategoriesByCategory: async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/subcategories`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      if (data.success && data.data) {
        // Filter subcategories by category_id
        const filteredSubcategories = data.data.filter(
          (subcategory) => subcategory.category_id === categoryId
        );
        return {
          ...data,
          data: filteredSubcategories,
        };
      }
      return data;
    } catch (error) {
      console.error("Error fetching subcategories by category:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch subcategories",
      };
    }
  },
};

// Helper function to get category name mappings
export const getCategoryMapping = () => {
  return {
    4: "Rest & Stay",
    5: "Car Rental",
    6: "Tour Packages",
    // Add more categories as needed
  };
};

// Helper function to get subcategory name by ID
export const getSubcategoryById = async (subcategoryId) => {
  try {
    const response = await subcategoryServices.fetchSubcategories();
    if (response.success && response.data) {
      const subcategory = response.data.find(
        (sub) => sub.subcategory_id === subcategoryId
      );
      return subcategory ? subcategory.name : null;
    }
    return null;
  } catch (error) {
    console.error("Error getting subcategory by ID:", error);
    return null;
  }
};
