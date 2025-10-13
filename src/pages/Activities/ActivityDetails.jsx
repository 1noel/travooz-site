import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  activityServices,
  transformActivityToFrontend,
} from "../../api/activities";

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await activityServices.fetchActivityById(id);
        console.log("Activity Details API Response:", response);

        if (response?.data) {
          const transformedActivity = transformActivityToFrontend(
            response.data
          );
          setActivity(transformedActivity);
        } else {
          setError("Activity not found");
        }
      } catch (err) {
        console.error("Failed to fetch activity details:", err);
        setError("Failed to load activity details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchActivityDetails();
    }
  }, [id]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBooking = () => {
    if (activity?.phone) {
      window.open(`tel:${activity.phone}`, "_self");
    } else {
      alert("Contact information not available. Please try again later.");
    }
  };

  const handleWhatsApp = () => {
    if (activity?.phone) {
      const message = `Hi! I'm interested in booking the ${activity.name} activity. Could you please provide more information?`;
      const whatsappUrl = `https://wa.me/${activity.phone.replace(
        /[^0-9]/g,
        ""
      )}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-6 bg-gray-300 rounded w-64 mb-6"></div>

          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {/* Main image skeleton */}
              <div className="w-full h-[350px] bg-gray-300 rounded-lg"></div>

              {/* Thumbnail gallery skeleton */}
              <div className="flex gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="w-20 h-16 bg-gray-300 rounded-lg"
                  ></div>
                ))}
              </div>

              {/* Info section skeleton */}
              <div className="bg-gray-200 rounded-lg p-5">
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="h-4 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-gray-200 rounded-lg p-5">
                <div className="text-center mb-6">
                  <div className="h-8 bg-gray-300 rounded w-2/3 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-300 rounded"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            <i className="fa fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/activities")}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Activities
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Activity not found
          </h2>
          <p className="text-gray-600 mb-4">
            The activity you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/activities")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  // Prepare images for gallery
  const allImages = [activity.mainImage, ...activity.galleryImages].filter(
    Boolean
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center space-x-2 text-md">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-800 cursor-pointer"
        >
          Home
        </button>
        <span className="text-gray-400">{"/"}</span>
        <button
          onClick={() => navigate("/activities")}
          className="text-green-600 hover:text-green-800 cursor-pointer"
        >
          Activities
        </button>
        <span className="text-gray-400">{"/"}</span>
        <span className="text-gray-600 text-sm">{activity.name}</span>
      </nav>

      {/* Activity Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {activity.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Grid - 60% Left, 40% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* Left Side - Activity Image, Description, Info (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Activity Image Gallery */}
          <div className="mb-6">
            {/* Main Image */}
            <div className="mb-4">
              <img
                src={allImages[selectedImageIndex] || activity.mainImage}
                alt={activity.name}
                className="w-full h-[350px] object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = "/images/kgl.jpg";
                }}
                loading="lazy"
              />
            </div>

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImageIndex === index
                          ? "border-green-500 ring-2 ring-green-200 shadow-lg"
                          : "border-gray-200 hover:border-green-300 hover:shadow-md"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                      title={`View photo ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${activity.name} view ${index + 1}`}
                        className="w-20 h-16 object-cover"
                        onError={(e) => {
                          e.target.src = "/images/kgl.jpg";
                        }}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Info */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              About {activity.name}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {activity.description}
            </p>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              {activity.location && (
                <div>
                  <span className="font-medium text-gray-800 text-xs">Location:</span>{" "}
                  {activity.location}
                </div>
              )}
              {activity.capacity && (
                <div>
                  <span className="font-medium text-gray-800 text-xs">Capacity:</span>{" "}
                  {activity.capacity} people
                </div>
              )}
              {activity.schedule && (
                <div>
                  <span className="font-medium text-gray-800 text-xs">Schedule:</span>{" "}
                  {activity.schedule}
                </div>
              )}
              {activity.vendorName && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-800 text-xs">Provider:</span>{" "}
                  {activity.vendorName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Booking Information (40%) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-5 sticky top-6">
            {/* Price */}
            {activity.price && (
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600">
                  {new Intl.NumberFormat("RW", {
                    style: "currency",
                    currency: "RWF",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(activity.price)}
                </div>
                <p className="text-gray-500 text-sm">Starting price</p>
              </div>
            )}

            {/* Contact Information */}
            {activity.phone && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Contact Information
                </h3>
                <div className="text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Phone:</span> {activity.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Booking Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBooking}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Call to Book
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                WhatsApp Inquiry
              </button>
            </div>

            {/* Additional Notes */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 space-y-2">
                <p>• Contact directly for availability</p>
                <p>• Verified activity provider</p>
                <p>• Instant response during business hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
