// src/pages/Activities/ActivityDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  activityServices,
  transformActivityToFrontend,
} from "../../api/activities";
import { useCart } from "../../context/useCart";
import Toast from "../../components/Toast";

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // New state for booking form
  const { addItem } = useCart();
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTravelers, setSelectedTravelers] = useState("1 Traveler");
  const [showTravelersDropdown, setShowTravelersDropdown] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookNow = () => {
    if (!activity) return;

    if (!selectedDate) {
      showToast("warning", "Please select a date for the activity.");
      return;
    }

    const travelersCount = parseInt(selectedTravelers, 10) || 1;

    addItem({
      id: `activity-${activity.id}-${Date.now()}`,
      type: "activity",
      name: activity.name,
      price: activity.price,
      currency: "RWF", // Set currency to RWF
      metadata: {
        Date: new Date(selectedDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        Travelers: travelersCount,
        Location: activity.location,
      },
    });

    showToast("success", `${activity.name} has been added to your cart.`);
  };

  // Calendar component
  const CustomCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const [displayMonth, setDisplayMonth] = useState(currentMonth);
    const [displayYear, setDisplayYear] = useState(currentYear);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const getDaysInMonth = (month, year) =>
      new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) =>
      new Date(year, month, 1).getDay();

    const handleDateSelect = (day) => {
      const date = new Date(displayYear, displayMonth, day);
      const formattedDate = date.toLocaleDateString("en-CA");
      setSelectedDate(formattedDate);
      setShowCalendar(false);
    };

    const handleMonthChange = (direction) => {
      setDisplayMonth((prev) => {
        const newMonth = prev + direction;
        if (newMonth < 0) {
          setDisplayYear(displayYear - 1);
          return 11;
        }
        if (newMonth > 11) {
          setDisplayYear(displayYear + 1);
          return 0;
        }
        return newMonth;
      });
    };

    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const days = Array.from({ length: firstDay }, () => <div />);
    for (let day = 1; day <= daysInMonth; day++) {
      const isPast =
        new Date(displayYear, displayMonth, day) <
        new Date(new Date().toDateString());
      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateSelect(day)}
          disabled={isPast}
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
            isPast
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-green-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <i className="fa fa-chevron-left text-gray-600"></i>
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[displayMonth]} {displayYear}
          </h3>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <i className="fa fa-chevron-right text-gray-600"></i>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-gray-500">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  // Custom Travelers Dropdown component
  const CustomTravelersDropdown = () => {
    const travelerOptions = [
      "1 Traveler",
      "2 Travelers",
      "3 Travelers",
      "4 Travelers",
      "5+ Travelers",
    ];
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
        {travelerOptions.map((option) => (
          <button
            key={option}
            onClick={() => {
              setSelectedTravelers(option);
              setShowTravelersDropdown(false);
            }}
            className={`w-full px-4 py-3 text-left hover:bg-green-50 ${
              selectedTravelers === option
                ? "text-green-600 font-bold"
                : "text-gray-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await activityServices.fetchActivityById(id);
        if (response?.data) {
          const transformedActivity = transformActivityToFrontend(
            response.data
          );
          setActivity(transformedActivity);
        } else {
          setError("Activity not found");
        }
      } catch (err) {
        setError("Failed to load activity details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchActivityDetails();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-64 mb-6"></div>
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="w-full h-96 bg-gray-300 rounded-lg"></div>
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-20 h-16 bg-gray-300 rounded-lg"
                  ></div>
                ))}
              </div>
              <div className="bg-gray-200 rounded-lg p-5 h-48"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-gray-200 rounded-lg p-5 h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {error || "Activity not found"}
        </h2>
        <button
          onClick={() => navigate("/activities")}
          className="px-6 py-2 bg-green-600 text-white rounded-lg"
        >
          Back to Activities
        </button>
      </div>
    );
  }

  const allImages = [activity.mainImage, ...activity.galleryImages].filter(
    Boolean
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <nav className="mb-6 flex items-center space-x-2 text-sm">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-800"
        >
          Home
        </button>
        <span className="text-gray-400">/</span>
        <button
          onClick={() => navigate("/activities")}
          className="text-green-600 hover:text-green-800"
        >
          Activities
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 font-medium truncate">
          {activity.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {activity.name}
            </h1>
          </div>
          <div className="space-y-4">
            <img
              src={allImages[selectedImageIndex] || activity.mainImage}
              alt={activity.name}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {allImages.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? "border-green-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${activity.name} view ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="py-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              About This Activity
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {activity.description}
            </p>
          </div>

          <div className="py-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              {activity.location && (
                <div className="flex items-center gap-2">
                  <i className="fa fa-map-marker-alt text-green-500"></i>{" "}
                  {activity.location}
                </div>
              )}
              {activity.capacity && (
                <div className="flex items-center gap-2">
                  <i className="fa fa-users text-green-500"></i> Up to{" "}
                  {activity.capacity} people
                </div>
              )}
              {activity.schedule && (
                <div className="flex items-center gap-2">
                  <i className="fa fa-clock text-green-500"></i>{" "}
                  {activity.schedule}
                </div>
              )}
              {activity.vendorName && (
                <div className="flex items-center gap-2">
                  <i className="fa fa-user-tie text-green-500"></i> Provided by{" "}
                  {activity.vendorName}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 w-full">
              {activity.price > 0 && (
                <div className="text-left mb-6">
                  <p className="text-gray-500 text-sm">Starting from</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat("en-RW", {
                      style: "currency",
                      currency: "RWF",
                      minimumFractionDigits: 0,
                    }).format(activity.price)}
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={selectedDate}
                    placeholder="Select a date"
                    readOnly
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  {showCalendar && <CustomCalendar />}
                </div>
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Travelers
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setShowTravelersDropdown(!showTravelersDropdown)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg text-left"
                  >
                    {selectedTravelers}
                  </button>
                  {showTravelersDropdown && <CustomTravelersDropdown />}
                </div>
                <button
                  onClick={handleBookNow}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ActivityDetails;
