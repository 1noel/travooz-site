import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { carServices, transformCarData, formatPrice } from "../../api/cars";
import Toast from "../../components/Toast";
import BookingModal from "../../components/BookingModal";
import BookingConfirmation from "../../components/BookingConfirmation";
import { useAuth } from "../../context/useAuth";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [relatedCars, setRelatedCars] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDays, setSelectedDays] = useState("1 Day");
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [toast, setToast] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const { isAuthenticated } = useAuth();

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      showToast("warning", "Please sign in to book a car");
      setTimeout(() => navigate("/sign-in"), 1500);
      return;
    }

    setShowBookingModal(true);
  };

  const handleBookingConfirm = async (bookingData) => {
    try {
      const response = await carServices.bookCarRental(bookingData);

      // For now, show confirmation regardless of API response (until database is connected)
      console.log("Booking response:", response);

      // Close booking modal
      setShowBookingModal(false);

      // Store booking data and show confirmation
      setConfirmedBooking(bookingData);
      setShowConfirmation(true);

      // Show success toast
      showToast(
        "success",
        "Booking confirmed! View your confirmation details below."
      );
    } catch (error) {
      console.error("Booking error:", error);

      // Still show confirmation even if API fails (for testing without database)
      setShowBookingModal(false);
      setConfirmedBooking(bookingData);
      setShowConfirmation(true);
      showToast(
        "success",
        "Booking confirmed! (Demo mode - database not connected)"
      );
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setConfirmedBooking(null);
    // Optionally redirect to cart or bookings page
    navigate("/cart");
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

  // Custom Days Dropdown component
  const CustomDaysDropdown = () => {
    const dayOptions = [
      { value: "1 Day", label: "1 Day" },
      { value: "2 Days", label: "2 Days" },
      { value: "3 Days", label: "3 Days" },
      { value: "1 Week", label: "1 Week" },
      { value: "2 Weeks", label: "2 Weeks" },
      { value: "1 Month", label: "1 Month" },
    ];

    const handleDaySelect = (option) => {
      setSelectedDays(option.value);
      setShowDaysDropdown(false);
    };

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
        {dayOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleDaySelect(option)}
            className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
              selectedDays === option.value
                ? "bg-green-50 text-green-600 font-medium"
                : "text-gray-700"
            } ${index === 0 ? "rounded-t-xl" : ""} ${
              index === dayOptions.length - 1 ? "rounded-b-xl" : ""
            }`}
          >
            <span className="font-medium">{option.label}</span>
            {selectedDays === option.value && (
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
    const fetchCarData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific car
        const carResponse = await carServices.getCarById(id);

        if (carResponse.success && carResponse.data) {
          const transformedCar = transformCarData(carResponse.data);
          setCar(transformedCar);
          setSelectedImage(transformedCar.mainImage);

          // Fetch all cars for related cars
          const allCarsResponse = await carServices.fetchCars();
          if (allCarsResponse.success && allCarsResponse.data) {
            const otherCars = allCarsResponse.data
              .filter((c) => c.car_id !== parseInt(id))
              .map(transformCarData)
              .filter((c) => c.category === transformedCar.category)
              .slice(0, 3); // Get 3 related cars
            setRelatedCars(otherCars);
          }
        } else {
          setError("Car not found");
        }
      } catch (err) {
        console.error("Error fetching car:", err);
        setError("Failed to load car details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarData();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 md:h-80 lg:h-96 bg-gray-200 rounded-xl mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !car) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-lg"></div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Car Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The car you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/cars")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Browse All Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-6">
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
          onClick={() => navigate("/cars")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Cars
        </button>
        <span className="text-gray-400">{"/"}</span>
        <span className="text-gray-600 font-medium truncate">
          {car.brand} {car.model}
        </span>
      </nav>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Car Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            {car.brand} {car.model}
          </h1>

          {/* Main Image */}
          <div className="mb-6">
            <img
              src={selectedImage}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* Image Gallery */}
          {car.images && car.images.length > 1 && (
            <div className="mb-8">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {car.images.map((img, index) => (
                  <div
                    key={img.id}
                    className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img.url
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img
                      src={img.url}
                      alt={`${car.brand} ${car.model} ${index + 1}`}
                      className="w-20 h-16 md:w-24 md:h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-6">
              {/* About This Car */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  About This Car
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {car.description}
                </p>
              </div>

              {/* Car Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  Car Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                      Location
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {car.location}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                      Year
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {car.year}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                      Seats
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {car.seatCapacity} people
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                      Transmission
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {car.transmission}
                    </span>
                  </div>
                </div>
                {car.color && (
                  <div className="mt-4">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">
                        Color
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {car.color}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              {car.features && Object.keys(car.features).length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-6">
                    Car Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(car.features)
                      .filter(([, value]) => value === true)
                      .map(([key]) => (
                        <div
                          key={key}
                          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="text-gray-800 font-medium leading-relaxed capitalize">
                            {key}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="bg-green-600 text-white p-4 rounded-xl mb-4">
                  <span className="text-3xl font-bold">
                    From {formatPrice(car.rates.daily, "$")}/day
                  </span>
                  <div className="text-green-100 text-sm mt-1">per day</div>
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
                    Number of Days
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDaysDropdown(!showDaysDropdown)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white text-gray-700 shadow-sm hover:border-gray-300 text-left flex items-center justify-between"
                    >
                      <span className="font-medium">{selectedDays}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          showDaysDropdown ? "rotate-180" : ""
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
                    {showDaysDropdown && <CustomDaysDropdown />}
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
                  <a
                    href="tel:+250780006775"
                    className="flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50 p-4 rounded-xl transition-all duration-200 border border-green-200"
                  >
                    <span className="text-sm font-semibold">
                      +250 780006775
                    </span>
                  </a>
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

      {/* Related Cars */}
      {relatedCars.length > 0 && (
        <section className="border-t border-gray-200 pt-8 md:pt-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">
            Similar Cars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {relatedCars.map((relatedCar) => (
              <article
                key={relatedCar.id}
                onClick={() => navigate(`/car/${relatedCar.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-green-200 group"
              >
                <img
                  src={relatedCar.mainImage}
                  alt={`${relatedCar.brand} ${relatedCar.model}`}
                  className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 md:p-6">
                  <h4 className="font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors text-base md:text-lg group-hover:text-green-600">
                    {relatedCar.brand} {relatedCar.model}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {relatedCar.year} • {relatedCar.seatCapacity} seats
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(relatedCar.rates.daily)}/day
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {relatedCar.category}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Car Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        bookingType="car rental"
        itemName={`${car.brand} ${car.model}`}
        onConfirmBooking={handleBookingConfirm}
        totalAmount={car.rates.daily}
        currency="USD"
      />

      {/* Booking Confirmation */}
      <BookingConfirmation
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        bookingData={confirmedBooking}
        car={car}
      />
    </div>
  );
};

export default CarDetails;
