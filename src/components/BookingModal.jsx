import React, { useState } from "react";

const BookingModal = ({
  isOpen,
  onClose,
  bookingType,
  itemName,
  onConfirmBooking,
  totalAmount,
  currency = "RWF",
}) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [mtnDetails, setMtnDetails] = useState({
    phoneNumber: "",
  });
  const [visaDetails, setVisaDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return new Intl.NumberFormat("en-RW", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validateMtnPhone = (phone) => {
    // Rwanda MTN phone numbers start with +250 78/79
    const mtnPattern = /^(\+250|0)?7[89]\d{7}$/;
    return mtnPattern.test(phone.replace(/\s/g, ""));
  };

  const validateVisaCard = () => {
    // Basic validation for card number (16 digits)
    const cardPattern = /^\d{16}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvPattern = /^\d{3,4}$/;

    if (!cardPattern.test(visaDetails.cardNumber.replace(/\s/g, ""))) {
      return "Invalid card number";
    }
    if (!expiryPattern.test(visaDetails.expiryDate)) {
      return "Invalid expiry date (MM/YY)";
    }
    if (!cvvPattern.test(visaDetails.cvv)) {
      return "Invalid CVV";
    }
    if (!visaDetails.cardholderName.trim()) {
      return "Cardholder name is required";
    }
    return null;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError("");
  };

  const handleMtnInputChange = (e) => {
    const { name, value } = e.target;
    setMtnDetails((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleVisaInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces every 4 digits
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    }

    // Format expiry date as MM/YY
    if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d{0,2})/, "$1/$2")
        .substring(0, 5);
    }

    // Limit CVV to 4 digits
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    }

    setVisaDetails((prev) => ({ ...prev, [name]: formattedValue }));
    setError("");
  };

  const handleConfirm = async () => {
    setError("");

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    if (paymentMethod === "mtn") {
      if (!validateMtnPhone(mtnDetails.phoneNumber)) {
        setError(
          "Please enter a valid MTN phone number (078xxxxxxx or 079xxxxxxx)"
        );
        return;
      }
    }

    if (paymentMethod === "visa") {
      const visaError = validateVisaCard();
      if (visaError) {
        setError(visaError);
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const paymentData = {
        method: paymentMethod,
        details:
          paymentMethod === "mtn"
            ? { phoneNumber: mtnDetails.phoneNumber }
            : {
                last4: visaDetails.cardNumber.replace(/\s/g, "").slice(-4),
                cardholderName: visaDetails.cardholderName,
              },
        amount: totalAmount,
        currency,
      };

      onConfirmBooking(paymentData);
      onClose();
    } catch {
      setError("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Complete Booking</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Booking Summary */}
          <div className="bg-transparent border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-medium mb-2">
              Booking Summary
            </p>
            <p className="text-gray-900 font-semibold mb-1">{itemName}</p>
            <p className="text-sm text-gray-600 capitalize">{bookingType}</p>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                {currency === "USD" ? "$" : ""}
                {formatCurrency(totalAmount)}
                {currency === "RWF" ? " RWF" : ""}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-3">
              {/* MTN Mobile Money */}
              <div
                onClick={() => handlePaymentMethodChange("mtn")}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  paymentMethod === "mtn"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-blue-900">
                      MTN
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        MTN Mobile Money
                      </p>
                      <p className="text-sm text-gray-600">
                        Pay with your MTN MoMo
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "mtn"
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "mtn" && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* VISA Card */}
              <div
                onClick={() => handlePaymentMethodChange("visa")}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  paymentMethod === "visa"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                      VISA
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">VISA Card</p>
                      <p className="text-sm text-gray-600">
                        Pay with your VISA card
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "visa"
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "visa" && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MTN Mobile Money Form */}
          {paymentMethod === "mtn" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MTN Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={mtnDetails.phoneNumber}
                  onChange={handleMtnInputChange}
                  placeholder="078xxxxxxx or 079xxxxxxx"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You'll receive a payment prompt on your phone
                </p>
              </div>
            </div>
          )}

          {/* VISA Card Form */}
          {paymentMethod === "visa" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={visaDetails.cardNumber}
                  onChange={handleVisaInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={visaDetails.cardholderName}
                  onChange={handleVisaInputChange}
                  placeholder="John Doe"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={visaDetails.expiryDate}
                    onChange={handleVisaInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={visaDetails.cvv}
                    onChange={handleVisaInputChange}
                    placeholder="123"
                    maxLength="4"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="text-xs text-gray-600">
                Your payment information is encrypted and secure. We never store
                your card details.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || !paymentMethod}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
              <>Confirm & Pay</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
