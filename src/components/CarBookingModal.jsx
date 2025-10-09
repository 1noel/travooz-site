import React, { useState } from "react";

const CarBookingModal = ({ isOpen, onClose, onConfirm, car }) => {
  const [formData, setFormData] = useState({
    pickupDate: "",
    pickupTime: "10:00",
    dropoffDate: "",
    dropoffTime: "18:00",
    pickupLocation: "Kigali",
    dropoffLocation: "Kigali",
    specialRequests: "",
    driverAge: "",
    driverLicenseNumber: "",
    insuranceOption: "basic",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Insurance options
  const insuranceOptions = [
    { id: "basic", name: "Basic", cost: 0, description: "Essential coverage" },
    {
      id: "standard",
      name: "Standard",
      cost: 3000,
      description: "Enhanced protection",
    },
    {
      id: "premium",
      name: "Premium",
      cost: 5000,
      description: "Complete peace of mind",
    },
  ];

  // Common locations in Rwanda
  const locations = [
    "Kigali",
    "Musanze",
    "Rubavu (Gisenyi)",
    "Rusizi (Cyangugu)",
    "Huye (Butare)",
    "Muhanga",
    "Nyanza",
    "Rwamagana",
    "Kigali Airport",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pickupDate) {
      newErrors.pickupDate = "Pickup date is required";
    }
    if (!formData.dropoffDate) {
      newErrors.dropoffDate = "Drop-off date is required";
    }
    if (!formData.driverAge || formData.driverAge < 21) {
      newErrors.driverAge = "Driver must be at least 21 years old";
    }
    if (!formData.driverLicenseNumber) {
      newErrors.driverLicenseNumber = "Driver's license number is required";
    }

    // Validate dates
    if (formData.pickupDate && formData.dropoffDate) {
      const pickup = new Date(formData.pickupDate);
      const dropoff = new Date(formData.dropoffDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (pickup < today) {
        newErrors.pickupDate = "Pickup date cannot be in the past";
      }
      if (dropoff <= pickup) {
        newErrors.dropoffDate = "Drop-off date must be after pickup date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateRentalDetails = () => {
    if (!formData.pickupDate || !formData.dropoffDate) {
      return {
        days: 0,
        dailyRate: car?.rates?.daily || 0,
        subtotal: 0,
        insuranceCost: 0,
        securityDeposit: 0,
        total: 0,
      };
    }

    const pickup = new Date(formData.pickupDate);
    const dropoff = new Date(formData.dropoffDate);
    const days = Math.max(
      1,
      Math.ceil((dropoff - pickup) / (1000 * 60 * 60 * 24))
    );

    const dailyRate = car?.rates?.daily || 0;
    const subtotal = dailyRate * days;

    const selectedInsurance = insuranceOptions.find(
      (opt) => opt.id === formData.insuranceOption
    );
    const insuranceCost = selectedInsurance ? selectedInsurance.cost * days : 0;

    const securityDeposit = dailyRate * 0.4; // 40% of daily rate
    const total = subtotal + insuranceCost;

    return {
      days,
      dailyRate,
      subtotal,
      insuranceCost,
      securityDeposit,
      total,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const rentalDetails = calculateRentalDetails();

    const bookingData = {
      car_id: car.id,
      pickup_date: formData.pickupDate,
      pickup_time: formData.pickupTime,
      dropoff_date: formData.dropoffDate,
      dropoff_time: formData.dropoffTime,
      daily_rate: rentalDetails.dailyRate,
      total_amount: rentalDetails.total,
      security_deposit: rentalDetails.securityDeposit,
      pickup_location: formData.pickupLocation,
      dropoff_location: formData.dropoffLocation,
      special_requests: formData.specialRequests || "",
      driver_age: parseInt(formData.driverAge),
      driver_license_number: formData.driverLicenseNumber,
      insurance_option: formData.insuranceOption,
      insurance_cost: rentalDetails.insuranceCost,
      status: "pending",
    };

    try {
      await onConfirm(bookingData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rentalDetails = calculateRentalDetails();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Complete Your Booking
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {car?.brand} {car?.model} - {car?.year}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Rental Dates & Times */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Rental Period
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.pickupDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.pickupDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pickupDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Drop-off Date *
                    </label>
                    <input
                      type="date"
                      name="dropoffDate"
                      value={formData.dropoffDate}
                      onChange={handleInputChange}
                      min={
                        formData.pickupDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.dropoffDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.dropoffDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.dropoffDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Drop-off Time
                    </label>
                    <input
                      type="time"
                      name="dropoffTime"
                      value={formData.dropoffTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pickup & Drop-off Locations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location
                    </label>
                    <select
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Drop-off Location
                    </label>
                    <select
                      name="dropoffLocation"
                      value={formData.dropoffLocation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Driver Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver Age *
                    </label>
                    <input
                      type="number"
                      name="driverAge"
                      value={formData.driverAge}
                      onChange={handleInputChange}
                      min="21"
                      max="100"
                      placeholder="Must be 21 or older"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.driverAge ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.driverAge && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.driverAge}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver's License Number *
                    </label>
                    <input
                      type="text"
                      name="driverLicenseNumber"
                      value={formData.driverLicenseNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., RA123456"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.driverLicenseNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.driverLicenseNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.driverLicenseNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Insurance Options */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Insurance Coverage
                </h3>
                <div className="space-y-3">
                  {insuranceOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.insuranceOption === option.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="insuranceOption"
                          value={option.id}
                          checked={formData.insuranceOption === option.id}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="ml-3">
                          <p className="font-semibold text-gray-800">
                            {option.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-600">
                        {option.cost === 0
                          ? "Free"
                          : `+RWF ${option.cost.toLocaleString()}/day`}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Special Requests (Optional)
                </h3>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any special requirements? (e.g., child seat, GPS, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Booking Summary
                </h3>

                {rentalDetails.days > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rental Duration</span>
                      <span className="font-semibold text-gray-800">
                        {rentalDetails.days}{" "}
                        {rentalDetails.days === 1 ? "day" : "days"}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Rate</span>
                      <span className="font-semibold text-gray-800">
                        RWF {rentalDetails.dailyRate.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-gray-800">
                        RWF {rentalDetails.subtotal.toLocaleString()}
                      </span>
                    </div>

                    {rentalDetails.insuranceCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Insurance</span>
                        <span className="font-semibold text-gray-800">
                          RWF {rentalDetails.insuranceCost.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm pt-4 border-t border-gray-200">
                      <span className="text-gray-600">Security Deposit</span>
                      <span className="font-semibold text-orange-600">
                        RWF {rentalDetails.securityDeposit.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between pt-4 border-t-2 border-gray-300">
                      <span className="text-lg font-bold text-gray-800">
                        Total
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        RWF {rentalDetails.total.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                      <p className="text-xs text-orange-800">
                        <strong>Note:</strong> Security deposit will be refunded
                        upon vehicle return in good condition.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Select pickup and drop-off dates to see pricing
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || rentalDetails.days === 0}
                  className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By confirming, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarBookingModal;
