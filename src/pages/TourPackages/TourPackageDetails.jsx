import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tourPackageServices } from "../../api/tourPackages";
import Toast from "../../components/Toast";

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
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTravelers, setSelectedTravelers] = useState("1 Person");
  const [showTravelersDropdown, setShowTravelersDropdown] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      showToast("warning", "Please select a preferred date first");
      return;
    }

    // Add to cart functionality would go here
    // For now, just show success message
    showToast("success", "Tour package added to cart successfully!");
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

    const getDaysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
      return new Date(year, month, 1).getDay();
    };

    const handleDateSelect = (day) => {
      const date = new Date(displayYear, displayMonth, day);
      const formattedDate = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
      setSelectedDate(formattedDate);
      setShowCalendar(false);
    };

    const handlePrevMonth = () => {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear(displayYear - 1);
      } else {
        setDisplayMonth(displayMonth - 1);
      }
    };

    const handleNextMonth = () => {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear(displayYear + 1);
      } else {
        setDisplayMonth(displayMonth + 1);
      }
    };

    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        displayMonth === currentMonth &&
        displayYear === currentYear;
      const isPast =
        new Date(displayYear, displayMonth, day) <
        new Date(currentYear, currentMonth, today.getDate());

      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateSelect(day)}
          disabled={isPast}
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
            isToday
              ? "bg-green-600 text-white shadow-lg"
              : isPast
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-green-100 hover:text-green-600"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[displayMonth]} {displayYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">{days}</div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowCalendar(false)}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setSelectedDate("");
              setShowCalendar(false);
            }}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    );
  };

  // Custom Travelers Dropdown component
  const CustomTravelersDropdown = () => {
    const travelerOptions = [
      { value: "1 Person", label: "1 Person" },
      { value: "2 People", label: "2 People" },
      { value: "3 People", label: "3 People" },
      { value: "4 People", label: "4 People" },
      { value: "5+ People", label: "5+ People" },
    ];

    const handleTravelerSelect = (option) => {
      setSelectedTravelers(option.value);
      setShowTravelersDropdown(false);
    };

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
        {travelerOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleTravelerSelect(option)}
            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
              selectedTravelers === option.value
                ? "bg-green-50 text-green-600 font-medium"
                : "text-gray-700"
            } ${index === 0 ? "rounded-t-xl" : ""} ${
              index === travelerOptions.length - 1 ? "rounded-b-xl" : ""
            }`}
          >
            <span className="font-medium">{option.label}</span>
            {selectedTravelers === option.value && (
              <span>
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

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

  // Close calendar and dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && !event.target.closest(".relative")) {
        setShowCalendar(false);
      }
      if (showTravelersDropdown && !event.target.closest(".relative")) {
        setShowTravelersDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar, showTravelersDropdown]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-6">
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
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-6">
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

  const tabs = [{ id: "overview", label: "Overview" }];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-6 pb-16">
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
            {/* Subcategory Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                {tourPackage.category}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {tourPackage.title}
            </h1>
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

                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Tour Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                        Category
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {tourPackage.category}
                      </span>
                    </div>
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
                  {tourPackage.phone && (
                    <div className="mt-4">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                          Contact
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {tourPackage.phone}
                        </span>
                      </div>
                    </div>
                  )}
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
          </div>
        </div>

        {/* Right Side - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="bg-green-600 text-white p-4 rounded-xl mb-4">
                  <span className="text-3xl font-bold">
                    From {tourPackage.currency === "USD" ? "$" : ""}
                    {tourPackage.price.toLocaleString()}
                    {tourPackage.currency === "RWF" ? " RWF" : ""}
                  </span>
                  <div className="text-green-100 text-sm mt-1">per person</div>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        selectedDate
                          ? new Date(selectedDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""
                      }
                      placeholder="Select a date"
                      readOnly
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all text-gray-700 bg-white shadow-sm hover:border-gray-300 cursor-pointer"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  {showCalendar && <CustomCalendar />}
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Number of Travelers
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowTravelersDropdown(!showTravelersDropdown)
                      }
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white text-gray-700 shadow-sm hover:border-gray-300 text-left flex items-center justify-between"
                    >
                      <span className="font-medium">{selectedTravelers}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          showTravelersDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    {showTravelersDropdown && <CustomTravelersDropdown />}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Special Requests
                  </label>
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 h-24 resize-none transition-all bg-white text-gray-700 shadow-sm hover:border-gray-300"
                    placeholder="Any special requirements or requests..."
                  ></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleBookNow}
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Book Now
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

      {/* Toast Notification */}
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

export default TourPackageDetails;
