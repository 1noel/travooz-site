import { API_BASE_URL } from "../config";

export const categoryServices ={
    fetchCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/categories`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    }
}