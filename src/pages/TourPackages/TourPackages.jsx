import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tourPackageServices } from "../../api/tourPackages";
import { subcategoryServices } from "../../api/subcategories";
import { useFilterContext } from "../../context/useFilterContext";
import Toast from "../../components/Toast";

const TourPackages = () => {
  const navigate = useNavigate();
  const { appliedFilters, filterAppliedTimestamp } = useFilterContext();
  const [tourPackages, setTourPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [toast, setToast] = useState(null);

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
              ? `https://pre.travoozapp.com${
                  pkg.images.find((img) => img.image_type === "main").image_path.startsWith("/")
                    ? pkg.images.find((img) => img.image_type === "main").image_path
                    : "/" + pkg.images.find((img) => img.image_type === "main").image_path
                }`
              : "/images/kgl.jpg",
            images: pkg.images
              ? [
                  pkg.images.find((img) => img.image_type === "main")
                    ? `https://pre.travoozapp.com${
                        pkg.images.find((img) => img.image_type === "main").image_path.startsWith("/")
                          ? pkg.images.find((img) => img.image_type === "main").image_path
                          : "/" + pkg.images.find((img) => img.image_type === "main").image_path
                      }`
                    : "/images/kgl.jpg",
                  ...pkg.images
                    .filter((img) => img.image_type === "gallery")
                    .map(
                      (img) =>
                        `https://pre.travoozapp.com${
                          img.image_path.startsWith("/")
                            ? img.image_path
                            : "/" + img.image_path
                        }`
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
          console.log("API response format unexpected");
          setTourPackages([]);
        }
      } catch (err) {
        console.error("Failed to fetch tour packages:", err);
        setError("Failed to load tour packages");
        setTourPackages([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch tour packages after subcategories are loaded
    if (subcategories.length > 0) {
      fetchTourPackages();
    }
  }, [subcategories, getSubcategoryName]);

  // Filter packages based on selected category and applied filters
  useEffect(() => {
    let filtered = tourPackages;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((pkg) => pkg.category === selectedCategory);
    }

    // Filter by destination/location
    if (appliedFilters.destination && appliedFilters.destination.trim()) {
      const searchTerm = appliedFilters.destination.toLowerCase().trim();
      filtered = filtered.filter(
        (pkg) =>
          pkg.location?.toLowerCase().includes(searchTerm) ||
          pkg.title?.toLowerCase().includes(searchTerm) ||
          pkg.description?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPackages(filtered);
  }, [tourPackages, selectedCategory, appliedFilters]);

  // Show toast when filters are applied
  useEffect(() => {
    if (
      filterAppliedTimestamp > 0 &&
      appliedFilters.destination &&
      appliedFilters.destination.trim() &&
      !loading
    ) {
      const currentFilter = appliedFilters.destination;

      if (filteredPackages.length === 0 && tourPackages.length > 0) {
        setToast({
          message: `No tour packages found matching "${currentFilter}". Try different search terms.`,
          type: "warning",
        });
      } else if (filteredPackages.length > 0) {
        setToast({
          message: `Found ${filteredPackages.length} tour package${
            filteredPackages.length > 1 ? "s" : ""
          } matching your search.`,
          type: "success",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAppliedTimestamp]);

  const handlePackageClick = (tourPackage) => {
    navigate(`/tour-package/${tourPackage.id}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="bg-white rounded shadow-sm overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="px-4 py-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10">
        <div className="text-center py-10">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5 mt-10 pb-16">
      <h1 className="text-2xl font-bold mb-4">Tour Packages</h1>

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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-5">
        {filteredPackages.map((tourPackage) => (
          <div
            key={tourPackage.id}
            onClick={() => handlePackageClick(tourPackage)}
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded"
          >
            <img
              src={tourPackage.mainImage || tourPackage.image}
              alt={tourPackage.title}
              className="w-full h-48 object-cover"
            />
            <div className="px-4 py-2">
              <h2 className="font-semibold text-gray-800">{tourPackage.title}</h2>
              <p className="text-xs text-gray-600">
                <i className="fa fa-location-dot"></i> {tourPackage.location}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {tourPackage.category} / {tourPackage.duration}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {tourPackage.groupSize}
                </span>
              </div>
              <div className="mt-2">
                <span className="font-bold text-green-600">
                  {tourPackage.currency === "USD" ? "$" : ""}
                  {tourPackage.price.toLocaleString()}
                  {tourPackage.currency === "RWF" ? " RWF" : ""}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">
            No tour packages found for "{selectedCategory}"
          </p>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TourPackages;
