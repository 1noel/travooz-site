import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const CarRentalHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, active, completed, cancelled
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    fetchBookings();
  }, [isAuthenticated, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // const response = await carServices.getUserBookings();

      // Mock data for now (will be replaced with real API)
      const mockBookings = [
        {
          id: 1,
          confirmation_number: "CR-251001-4523",
          car: {
            brand: "Toyota",
            model: "RAV4",
            year: 2023,
            image: "/images/kvb.webp",
          },
          pickup_date: "2025-10-15",
          pickup_time: "10:00",
          dropoff_date: "2025-10-17",
          dropoff_time: "18:00",
          pickup_location: "Kigali",
          dropoff_location: "Kigali",
          daily_rate: 50000,
          total_amount: 110000,
          insurance_option: "premium",
          insurance_cost: 10000,
          security_deposit: 20000,
          driver_age: 30,
          driver_license_number: "RA123456",
          special_requests: "Child seat",
          status: "confirmed",
          booking_date: "2025-10-01T10:30:00",
        },
        {
          id: 2,
          confirmation_number: "CR-251005-7821",
          car: {
            brand: "Honda",
            model: "CR-V",
            year: 2024,
            image: "/images/kvs.jpg",
          },
          pickup_date: "2025-09-20",
          pickup_time: "09:00",
          dropoff_date: "2025-09-25",
          dropoff_time: "17:00",
          pickup_location: "Kigali Airport",
          dropoff_location: "Musanze",
          daily_rate: 60000,
          total_amount: 315000,
          insurance_option: "standard",
          insurance_cost: 15000,
          security_deposit: 24000,
          driver_age: 28,
          driver_license_number: "RA789012",
          special_requests: "GPS navigation",
          status: "completed",
          booking_date: "2025-09-05T14:20:00",
        },
        {
          id: 3,
          confirmation_number: "CR-251008-2156",
          car: {
            brand: "Nissan",
            model: "X-Trail",
            year: 2023,
            image: "/images/kivu.jpg",
          },
          pickup_date: "2025-11-01",
          pickup_time: "08:00",
          dropoff_date: "2025-11-03",
          dropoff_time: "20:00",
          pickup_location: "Rubavu (Gisenyi)",
          dropoff_location: "Kigali",
          daily_rate: 55000,
          total_amount: 110000,
          insurance_option: "basic",
          insurance_cost: 0,
          security_deposit: 22000,
          driver_age: 35,
          driver_license_number: "RA345678",
          special_requests: "",
          status: "pending",
          booking_date: "2025-10-08T16:45:00",
        },
      ];

      setBookings(mockBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      active: "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-gray-100 text-gray-800 border-gray-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || colors.pending;
  };

  const getInsuranceName = (option) => {
    const names = {
      basic: "Basic Coverage",
      standard: "Standard Coverage",
      premium: "Premium Coverage",
    };
    return names[option] || option;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDays = (pickupDate, dropoffDate) => {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const days = Math.ceil((dropoff - pickup) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handlePrintBooking = (booking) => {
    setSelectedBooking(booking);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadBooking = (booking) => {
    const content = `
TRAVOOZ CAR RENTAL - BOOKING DETAILS
====================================

Confirmation Number: ${booking.confirmation_number}
Booking Date: ${new Date(booking.booking_date).toLocaleString()}

VEHICLE INFORMATION
-------------------
Vehicle: ${booking.car.brand} ${booking.car.model} (${booking.car.year})

RENTAL DETAILS
--------------
Pickup: ${formatDate(booking.pickup_date)} at ${booking.pickup_time}
Drop-off: ${formatDate(booking.dropoff_date)} at ${booking.dropoff_time}

Pickup Location: ${booking.pickup_location}
Drop-off Location: ${booking.dropoff_location}

DRIVER INFORMATION
------------------
Age: ${booking.driver_age} years
License Number: ${booking.driver_license_number}

PRICING
-------
Daily Rate: RWF ${booking.daily_rate.toLocaleString()}
Insurance (${getInsuranceName(
      booking.insurance_option
    )}): RWF ${booking.insurance_cost.toLocaleString()}
Security Deposit: RWF ${booking.security_deposit.toLocaleString()}
Total Amount: RWF ${booking.total_amount.toLocaleString()}

Special Requests: ${booking.special_requests || "None"}
Status: ${booking.status.toUpperCase()}

Thank you for choosing Travooz Car Rental!
Contact: +250 780006775
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Travooz-${booking.confirmation_number}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          My Car Rental History
        </h1>
        <p className="text-gray-600">
          View and manage all your car rental bookings
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          {[
            { value: "all", label: "All Bookings" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                filter === tab.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              {tab.value !== "all" && (
                <span className="ml-2 text-sm">
                  ({bookings.filter((b) => b.status === tab.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Bookings Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === "all"
              ? "You haven't made any car rental bookings yet."
              : `You don't have any ${filter} bookings.`}
          </p>
          <button
            onClick={() => navigate("/cars")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Browse Cars
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="md:flex">
                {/* Car Image */}
                <div className="md:w-1/3">
                  <img
                    src={booking.car.image}
                    alt={`${booking.car.brand} ${booking.car.model}`}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="md:w-2/3 p-6">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.car.brand} {booking.car.model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.car.year} • Confirmation:{" "}
                        <span className="font-semibold text-green-600">
                          {booking.confirmation_number}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Rental Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Pickup</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(booking.pickup_date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        at {booking.pickup_time} • {booking.pickup_location}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(booking.dropoff_date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        at {booking.dropoff_time} • {booking.dropoff_location}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Duration */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-800">
                        {calculateDays(
                          booking.pickup_date,
                          booking.dropoff_date
                        )}{" "}
                        days
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Insurance</p>
                      <p className="font-semibold text-gray-800">
                        {getInsuranceName(booking.insurance_option)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-bold text-green-600 text-lg">
                        RWF {booking.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Details
                    </button>
                    <button
                      onClick={() => handlePrintBooking(booking)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Print
                    </button>
                    <button
                      onClick={() => handleDownloadBooking(booking)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Booking Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBooking.confirmation_number}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span
                  className={`px-6 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                    selectedBooking.status
                  )}`}
                >
                  {selectedBooking.status.toUpperCase()}
                </span>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Vehicle Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedBooking.car.brand} {selectedBooking.car.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedBooking.car.year}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Rental Period
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pickup</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(selectedBooking.pickup_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      at {selectedBooking.pickup_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(selectedBooking.dropoff_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      at {selectedBooking.dropoff_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-semibold text-gray-800">
                      {calculateDays(
                        selectedBooking.pickup_date,
                        selectedBooking.dropoff_date
                      )}{" "}
                      days
                    </p>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  Locations
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedBooking.pickup_location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drop-off:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedBooking.dropoff_location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Driver Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedBooking.driver_age} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedBooking.driver_license_number}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  Price Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Daily Rate</span>
                    <span className="font-semibold">
                      RWF {selectedBooking.daily_rate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>
                      Insurance (
                      {getInsuranceName(selectedBooking.insurance_option)})
                    </span>
                    <span className="font-semibold">
                      RWF {selectedBooking.insurance_cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Security Deposit (Refundable)</span>
                    <span className="font-semibold text-orange-600">
                      RWF {selectedBooking.security_deposit.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                    <span className="text-xl font-bold text-gray-800">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      RWF {selectedBooking.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-800 mb-2">
                    Special Requests
                  </h3>
                  <p className="text-gray-700">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}

              {/* Booking Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Booked on:</span>
                  <span className="font-semibold">
                    {new Date(selectedBooking.booking_date).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarRentalHistory;
