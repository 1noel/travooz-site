import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tourPackageServices } from "../../api/tourPackages";

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

const TourPackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchTourPackage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first
        const response = await tourPackageServices.fetchTourPackageById(id);
        if (response?.success && response?.data) {
          const pkg = response.data;
          // Transform API data to frontend format
          const transformedPackage = {
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
            exclusions: [],
            whatToBring: pkg.what_to_bring
              ? pkg.what_to_bring.split("\n").filter((w) => w.trim())
              : [],
            meetingPoint: pkg.meeting_point_details,
            thingsToKnow: pkg.things_to_know,
            category: getCategoryFromSubcategoryId(pkg.subcategory_id),
          };

          setTourPackage(transformedPackage);
          setSelectedImage(transformedPackage.mainImage);
        } else {
          setError("Tour package not found");
        }
      } catch (err) {
        console.error("Failed to fetch tour package:", err);
        setError("Failed to load tour package");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTourPackage();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
              <div className="flex gap-2 mb-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-16 w-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-gray-200 h-96 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tourPackage) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Tour Package Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The tour package you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/tour-packages")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Browse All Tour Packages
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "itinerary", label: "Itinerary" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center space-x-3 text-sm">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Home
        </button>
        <span className="text-gray-400">{"/"}</span>
        <button
          onClick={() => navigate("/tour-packages")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Tour Packages
        </button>
        <span className="text-gray-400">{"/"}</span>
        <span className="text-gray-600 font-medium">{tourPackage.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {tourPackage.title}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                  Location
                </span>
                <span className="text-gray-900 font-semibold">
                  {tourPackage.location}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                  Duration
                </span>
                <span className="text-gray-900 font-semibold">
                  {tourPackage.duration}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                  Group Size
                </span>
                <span className="text-gray-900 font-semibold">
                  {tourPackage.groupSize}
                </span>
              </div>
              {tourPackage.instructorLanguage && (
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                    Language
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {tourPackage.instructorLanguage}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Side - Images and Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="mb-4">
              <img
                src={selectedImage}
                alt={tourPackage.title}
                className="w-full h-[400px] object-cover rounded-xl shadow-lg"
              />
            </div>

            {tourPackage.images && tourPackage.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {tourPackage.images.map((img, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${tourPackage.title} view ${index + 1}`}
                      className="w-24 h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex border-b-2 border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-4 font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-green-600"
                      : "text-gray-600 hover:text-green-600"
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    About This Tour
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {tourPackage.fullDescription || tourPackage.description}
                  </p>
                </div>

                {tourPackage.highlights && (
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-6">
                      Tour Highlights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tourPackage.highlights.map((highlight, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-gray-800 font-medium leading-relaxed">
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Tour Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">
                          Duration:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {tourPackage.duration}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">
                          Group Size:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {tourPackage.groupSize}
                        </span>
                      </div>
                      {tourPackage.instructorLanguage && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">
                            Languages:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {tourPackage.instructorLanguage}
                          </span>
                        </div>
                      )}
                      {tourPackage.phone && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">
                            Contact:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {tourPackage.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Special Features
                    </h4>
                    <div className="space-y-3">
                      {tourPackage.freeCancellation && (
                        <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-green-200">
                          <span className="text-gray-800 font-medium">
                            Free Cancellation Available
                          </span>
                        </div>
                      )}
                      {tourPackage.reserveNowPayLater && (
                        <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-blue-200">
                          <span className="text-gray-800 font-medium">
                            Reserve Now, Pay Later Option
                          </span>
                        </div>
                      )}
                      {!tourPackage.freeCancellation &&
                        !tourPackage.reserveNowPayLater && (
                          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            <span className="text-gray-600 font-medium">
                              Standard booking terms apply
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Meeting Point */}
                {tourPackage.meetingPoint && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      Meeting Point
                    </h4>
                    <p className="text-gray-800 leading-relaxed">
                      {tourPackage.meetingPoint}
                    </p>
                  </div>
                )}

                {/* What to Bring */}
                {tourPackage.whatToBring &&
                  tourPackage.whatToBring.length > 0 && (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-6">
                        What to Bring
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tourPackage.whatToBring.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                          >
                            <span className="text-gray-800 font-medium">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Things to Know */}
                {tourPackage.thingsToKnow && (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      Important Information
                    </h4>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {tourPackage.thingsToKnow}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "itinerary" && (
              <div>
                {tourPackage.itinerary && tourPackage.itinerary.length > 0 ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Day by Day Itinerary
                    </h3>
                    <div className="space-y-6">
                      {tourPackage.itinerary.map((day, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
                        >
                          <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                            Day {day.day}: {day.title}
                          </h4>
                          <div className="space-y-3">
                            {day.activities.map((activity, actIndex) => (
                              <div
                                key={actIndex}
                                className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-600"
                              >
                                <span className="text-gray-800 font-medium leading-relaxed">
                                  {activity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Detailed Itinerary Available Upon Request
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Contact us for a complete day-by-day schedule and activity
                      breakdown.
                    </p>
                    {tourPackage.phone && (
                      <a
                        href={`tel:${tourPackage.phone}`}
                        className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Call {tourPackage.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="bg-green-600 text-white p-4 rounded-xl mb-4">
                  <span className="text-3xl font-bold">
                    {tourPackage.currency === "USD" ? "$" : ""}
                    {tourPackage.price.toLocaleString()}
                    {tourPackage.currency === "RWF" ? " RWF" : ""}
                  </span>
                  <div className="text-green-100 text-sm mt-1">per person</div>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Travelers
                  </label>
                  <select className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors">
                    <option>1 Person</option>
                    <option>2 People</option>
                    <option>3 People</option>
                    <option>4 People</option>
                    <option>5+ People</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 h-24 resize-none transition-colors"
                    placeholder="Any special requirements or requests..."
                  ></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Book Now
                </button>
                <button className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-4 rounded-xl font-semibold transition-all duration-200">
                  Get Quote
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4 text-center font-medium">
                  Need help? Contact us:
                </p>
                <div className="space-y-3">
                  {tourPackage.phone && (
                    <a
                      href={`tel:${tourPackage.phone}`}
                      className="flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50 p-4 rounded-xl transition-all duration-200 border border-green-200"
                    >
                      <span className="text-sm font-semibold">
                        {tourPackage.phone}
                      </span>
                    </a>
                  )}
                  <a
                    href="mailto:info@travooz.com"
                    className="flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50 p-4 rounded-xl transition-all duration-200 border border-green-200"
                  >
                    <span className="text-sm font-semibold">
                      info@travooz.com
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourPackageDetails;
