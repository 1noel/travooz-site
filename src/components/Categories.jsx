import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryServices } from "../api/categories_api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Dynamic icon mapping based on category names
  const getIconForCategory = (categoryName) => {
    const iconMap = {
      Activities: "fa fa-person-hiking",
      "Eating Out": "fa fa-utensils",
      "Nightlife and entertainment": "fa fa-cocktail",
      "Rest & Stay": "fa fa-bed",
      "Car Rental": "fa fa-car",
      "Tour Packages": "fa fa-map-marked-alt",
      Hospital: "fa fa-hospital",
      "Forex Bureau": "fa fa-exchange-alt",
    };
    return iconMap[categoryName] || "fa fa-tag";
  };

  // Handle category click navigation
  const handleCategoryClick = (categoryName) => {
    // Check if category name contains "eating" (case insensitive)
    const normalizedName = categoryName.toLowerCase();
    if (normalizedName.includes("eating")) {
      navigate("/eating-out");
    } else if (
      normalizedName.includes("tour") ||
      normalizedName.includes("package")
    ) {
      navigate("/tour-packages");
    } else if (
      normalizedName.includes("car") ||
      normalizedName.includes("rental")
    ) {
      navigate("/cars");
    }
    // Add more navigation logic for other categories as needed
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await categoryServices.fetchCategories();

        if (response?.data && Array.isArray(response.data)) {
          // Filter only active categories and transform data
          const activeCategories = response.data
            .filter((category) => category.status === "active")
            .map((category) => ({
              id: category.category_id,
              name: category.name,
              icon: getIconForCategory(category.name),
              description: category.description,
              image: category.image,
            }));

          setCategories(activeCategories);
        } else {
          setError("No categories available");
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="my-5 px-2">
        <div className="flex justify-center gap-3 items-center flex-wrap">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="px-4 py-2 rounded-xl bg-gray-200 animate-pulse h-9 w-28"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="my-5 px-2">
        <div className="flex justify-center items-center">
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <i className="fa fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <div className="my-5 px-2">
        <div className="flex justify-center items-center">
          <div className="text-gray-500 text-sm">No categories available</div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="my-5 px-4">
      <div className="flex justify-center gap-2 lg:gap-3 items-center flex-wrap max-w-7xl mx-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className="px-3 py-2 lg:px-4 lg:py-2 rounded-xl bg-white shadow-sm border border-gray-100 
                                 text-green-600 hover:bg-green-50 hover:shadow-md hover:border-green-200
                                 transition-all duration-200 ease-in-out cursor-pointer
                                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
                                 text-sm lg:text-base"
            title={category.description}
          >
            <i
              className={`${category.icon} mr-1 lg:mr-2 text-xs lg:text-sm`}
            ></i>
            <span className="font-medium">{category.name}</span>
          </button>
        ))}

        {/* Blogs Button */}
        <button
          onClick={() => navigate("/blogs")}
          className="px-3 py-2 lg:px-4 lg:py-2 rounded-xl bg-white shadow-sm border border-gray-100 
                               text-green-600 hover:bg-green-50 hover:shadow-md hover:border-green-200
                               transition-all duration-200 ease-in-out cursor-pointer
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
                               text-sm lg:text-base"
          title="Read travel blogs and stories"
        >
          <i className="fa fa-blog mr-1 lg:mr-2 text-xs lg:text-sm"></i>
          <span className="font-medium">Travel Blogs</span>
        </button>
      </div>
    </div>
  );
};

export default Categories;
