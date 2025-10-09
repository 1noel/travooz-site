import React from "react";
import { useNavigate } from "react-router-dom";

const BookingConfirmation = ({ isOpen, onClose, bookingData, car }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const generateConfirmationNumber = () => {
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `CR-${date}-${random}`;
  };

  const confirmationNumber =
    bookingData?.confirmation_number || generateConfirmationNumber();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString || "N/A";
  };

  const getInsuranceName = (option) => {
    const insuranceMap = {
      basic: "Basic Coverage",
      standard: "Standard Coverage",
      premium: "Premium Coverage",
    };
    return insuranceMap[option] || option;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text version for download
    const content = `
TRAVOOZ CAR RENTAL - BOOKING CONFIRMATION
==========================================

Confirmation Number: ${confirmationNumber}
Booking Date: ${new Date().toLocaleString()}

VEHICLE INFORMATION
-------------------
Vehicle: ${car?.brand} ${car?.model} (${car?.year})
Category: ${car?.category || "N/A"}

RENTAL DETAILS
--------------
Pickup Date: ${formatDate(bookingData?.pickup_date)} at ${formatTime(
      bookingData?.pickup_time
    )}
Drop-off Date: ${formatDate(bookingData?.dropoff_date)} at ${formatTime(
      bookingData?.dropoff_time
    )}

Pickup Location: ${bookingData?.pickup_location}
Drop-off Location: ${bookingData?.dropoff_location}

DRIVER INFORMATION
------------------
Age: ${bookingData?.driver_age} years
License Number: ${bookingData?.driver_license_number}

PRICING
-------
Daily Rate: RWF ${bookingData?.daily_rate?.toLocaleString()}
Total Amount: RWF ${bookingData?.total_amount?.toLocaleString()}
Insurance (${getInsuranceName(
      bookingData?.insurance_option
    )}): RWF ${bookingData?.insurance_cost?.toLocaleString()}
Security Deposit: RWF ${bookingData?.security_deposit?.toLocaleString()}

Special Requests: ${bookingData?.special_requests || "None"}

Status: ${bookingData?.status?.toUpperCase() || "PENDING"}

Thank you for choosing Travooz Car Rental!
Contact: +250 780006775
Website: www.travooz.com
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Travooz-Booking-${confirmationNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-t-2xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <svg
                className="w-12 h-12 text-green-600"
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
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-center text-green-50 text-lg">
            Your car rental has been successfully booked
          </p>
        </div>

        {/* Confirmation Content */}
        <div className="p-8">
          {/* Confirmation Number */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
              <p className="text-3xl font-bold text-green-600 tracking-wider">
                {confirmationNumber}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Save this number for your records
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Vehicle Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 rounded-full p-2">
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
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Vehicle Information
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-semibold text-gray-800">
                    {car?.brand} {car?.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-semibold text-gray-800">
                    {car?.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold text-gray-800">
                    {car?.category || "Standard"}
                  </span>
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 rounded-full p-2">
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
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Rental Period
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pickup</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(bookingData?.pickup_date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    at {formatTime(bookingData?.pickup_time)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(bookingData?.dropoff_date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    at {formatTime(bookingData?.dropoff_time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 rounded-full p-2">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Locations</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup:</span>
                  <span className="font-semibold text-gray-800">
                    {bookingData?.pickup_location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drop-off:</span>
                  <span className="font-semibold text-gray-800">
                    {bookingData?.dropoff_location}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 rounded-full p-2">
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
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Driver Details
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-semibold text-gray-800">
                    {bookingData?.driver_age} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">License:</span>
                  <span className="font-semibold text-gray-800">
                    {bookingData?.driver_license_number}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Price Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Daily Rate</span>
                <span className="font-semibold">
                  RWF {bookingData?.daily_rate?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>
                  Insurance ({getInsuranceName(bookingData?.insurance_option)})
                </span>
                <span className="font-semibold">
                  RWF {bookingData?.insurance_cost?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Security Deposit (Refundable)</span>
                <span className="font-semibold text-orange-600">
                  RWF {bookingData?.security_deposit?.toLocaleString()}
                </span>
              </div>
              <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between">
                <span className="text-xl font-bold text-gray-800">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-green-600">
                  RWF {bookingData?.total_amount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {bookingData?.special_requests && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Special Requests
              </h3>
              <p className="text-gray-700">{bookingData.special_requests}</p>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-100 border border-yellow-300 rounded-full px-6 py-2">
              <span className="text-yellow-800 font-semibold uppercase text-sm">
                Status: {bookingData?.status || "Pending Confirmation"}
              </span>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-orange-900">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  Please bring your driver's license and a valid ID on pickup
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  Security deposit will be refunded within 3-5 business days
                  after vehicle return
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  Vehicle should be returned with the same fuel level as pickup
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  Late returns may incur additional charges (prorated hourly
                  rate)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  For cancellations or modifications, contact us at least 24
                  hours in advance
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Need Help?
            </h3>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-gray-700 font-semibold">
                  +250 780006775
                </span>
              </div>
              <div className="flex items-center gap-2">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-700 font-semibold">
                  info@travooz.com
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePrint}
              className="flex-1 px-6 py-4 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
              onClick={handleDownload}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
            <button
              onClick={() => {
                onClose();
                navigate("/car-rental-history");
              }}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
