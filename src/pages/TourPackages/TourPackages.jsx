import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  tourPackageServices,
  getAllTourPackages,
} from "../../api/tourPackages";
import { subcategoryServices } from "../../api/subcategories";

const TourPackages = () => {
  const navigate = useNavigate();
  const [tourPackages, setTourPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  // Helper function to get subcategory name by ID
  const getSubcategoryName = React.useCallback(
    (subcategoryId) => {
      const subcategory = subcategories.find(
        (sub) => sub.subcategory_id === subcategoryId
      );
      return subcategory ? subcategory.name : "Other";
    },
    [subcategories]
  );

  useEffect(() => {
    // Fetch subcategories first
    const fetchSubcategories = async () => {
      try {
        const response = await subcategoryServices.fetchSubcategoriesByCategory(
          6
        ); // Category 6 is Tour Packages
        if (response.success && response.data) {
          setSubcategories(response.data);
          // Create dynamic categories based on subcategories
          const subcategoryNames = response.data.map((sub) => sub.name);
          setCategories(["All", ...subcategoryNames]);
        }
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      }
    };

    fetchSubcategories();
  }, []);

  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first
        const response = await tourPackageServices.fetchTourPackages();
        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data)
        ) {
          // Transform API data to frontend format
          const transformedPackages = response.data.map((pkg) => ({
            id: pkg.package_id,
            title: pkg.name,
            description: pkg.description_short,
            fullDescription: pkg.description_full || pkg.description_short,
            duration: pkg.duration,
            price: parseFloat(pkg.price),
            currency: pkg.currency,
            location: pkg.location,
            groupSize: `${pkg.min_people}-${pkg.max_people} people`,
            mainImage: pkg.images?.find((img) => img.image_type === "main")
              ? `https://travooz.kadgroupltd.com/${
                  pkg.images.find((img) => img.image_type === "main").image_path
                }`
              : "/images/kgl.jpg",
            images: pkg.images
              ? [
                  pkg.images.find((img) => img.image_type === "main")
                    ? `https://travooz.kadgroupltd.com/${
                        pkg.images.find((img) => img.image_type === "main")
                          .image_path
                      }`
                    : "/images/kgl.jpg",
                  ...pkg.images
                    .filter((img) => img.image_type === "gallery")
                    .map(
                      (img) =>
                        `https://travooz.kadgroupltd.com/${img.image_path}`
                    ),
                ]
              : ["/images/kgl.jpg"],
            highlights: pkg.highlights
              ? pkg.highlights.split("\n").filter((h) => h.trim())
              : [],
            phone: pkg.phone,
            maxPeople: pkg.max_people,
            minPeople: pkg.min_people,
            freeCancellation: pkg.free_cancellation,
            reserveNowPayLater: pkg.reserve_now_pay_later,
            instructorLanguage: pkg.instructor_language,
            includes: pkg.includes
              ? pkg.includes.split("\n").filter((i) => i.trim())
              : [],
            meetingPoint: pkg.meeting_point_details,
            thingsToKnow: pkg.things_to_know,
            category: getSubcategoryName(pkg.subcategory_id),
          }));
          setTourPackages(transformedPackages);
        } else {
          // Fallback to mock data
          console.log("API response format unexpected, using mock data");
          setTourPackages(getAllTourPackages());
        }
      } catch (err) {
        console.error("Failed to fetch tour packages:", err);
        setError("Failed to load tour packages");
        // Still try to load mock data on error
        setTourPackages(getAllTourPackages());
      } finally {
        setLoading(false);
      }
    };

    // Only fetch tour packages after subcategories are loaded
    if (subcategories.length > 0) {
      fetchTourPackages();
    }
  }, [subcategories, getSubcategoryName]);

  // Filter packages based on selected category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredPackages(tourPackages);
    } else {
      setFilteredPackages(
        tourPackages.filter((pkg) => pkg.category === selectedCategory)
      );
    }
  }, [tourPackages, selectedCategory]);

  const handlePackageClick = (tourPackage) => {
    navigate(`/tour-package/${tourPackage.id}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-5 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 space-y-5 mt-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
          Tour Packages
        </h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span className="font-medium text-sm md:text-base">{error}</span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <span
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`cursor-pointer pb-1 transition-colors ${
                selectedCategory === category
                  ? "border-b-2 border-green-500 text-green-500"
                  : "hover:text-green-500"
              }`}
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Tour Packages Grid */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
            No Tour Packages Found
          </h3>
          <p className="text-gray-500 text-sm md:text-base">
            {selectedCategory === "All"
              ? "No tour packages are currently available."
              : `No tour packages found in the "${selectedCategory}" category.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
          {filteredPackages.map((tourPackage) => (
            <div
              key={tourPackage.id}
              onClick={() => handlePackageClick(tourPackage)}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-green-200"
            >
              {/* Package Image */}
              <div className="relative overflow-hidden">
                <img
                  src={tourPackage.mainImage || tourPackage.image}
                  alt={tourPackage.title}
                  className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium shadow-lg">
                  {tourPackage.duration}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Package Content */}
              <div className="p-4 md:p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block bg-green-600 text-white text-xs font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                    {tourPackage.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors leading-tight">
                  {tourPackage.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {tourPackage.description}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
                      Location
                    </span>
                    <span className="text-gray-800 font-semibold truncate">
                      {tourPackage.location}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
                      Duration
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {tourPackage.duration}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
                      Group Size
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {tourPackage.groupSize}
                    </span>
                  </div>
                  {tourPackage.instructorLanguage && (
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">
                        Language
                      </span>
                      <span className="text-gray-800 font-semibold truncate">
                        {tourPackage.instructorLanguage}
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Info Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tourPackage.freeCancellation && (
                    <span className="inline-flex items-center bg-green-50 text-green-700 text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-green-200 font-medium">
                      Free Cancellation
                    </span>
                  )}
                  {tourPackage.reserveNowPayLater && (
                    <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-blue-200 font-medium">
                      Reserve & Pay Later
                    </span>
                  )}
                </div>

                {/* Price and Book Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xl md:text-2xl font-bold text-green-600">
                      {tourPackage.currency === "USD" ? "$" : ""}
                      {tourPackage.price.toLocaleString()}
                      {tourPackage.currency === "RWF" ? " RWF" : ""}
                    </span>
                    <span className="text-gray-500 text-xs md:text-sm ml-1 block">
                      per {tourPackage.duration}
                    </span>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TourPackages;
