// src/pages/Cart/Cart.jsx

import React, { useState } from "react";
import { useCart } from "../../context/useCart";
import { useNavigate } from "react-router-dom";
import BookingModal from "../../components/BookingModal";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/useAuth";

const Cart = () => {
  const { items, cartCount, clearCart, removeItem } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [bookingHistory, setBookingHistory] = useState(() => {
    // Load booking history from localStorage
    try {
      const stored = localStorage.getItem("travooz-booking-history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      // Only include items with prices in the total
      if (!item.price) return total;
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 1;
      return total + itemPrice * itemQuantity;
    }, 0);
  };

  const hasPricedItems = items.some(
    (item) => item.price && parseFloat(item.price) > 0
  );
  const hasUnpricedItems = items.some(
    (item) => !item.price || parseFloat(item.price) <= 0
  );

  const handleCheckout = () => {
    if (cartCount === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    if (!isAuthenticated) {
      showToast("Please sign in to complete your booking.", "warning");
      setTimeout(() => navigate("/sign-in"), 2000);
      return;
    }

    // Open payment modal for priced items
    setIsPaymentModalOpen(true);
  };

  const saveToHistory = (bookingData) => {
    const historyEntry = {
      id: `booking-${Date.now()}`,
      date: new Date().toISOString(),
      items: bookingData.items,
      paymentMethod: bookingData.paymentMethod || "N/A",
      totalAmount: bookingData.totalAmount || 0,
      status: bookingData.status || "confirmed",
      type: bookingData.type || "booking",
    };

    const updatedHistory = [historyEntry, ...bookingHistory];
    setBookingHistory(updatedHistory);

    // Save to localStorage
    try {
      localStorage.setItem(
        "travooz-booking-history",
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error("Failed to save booking history:", error);
    }
  };

  const handleConfirmBookingsWithoutPayment = () => {
    if (!isAuthenticated) {
      showToast("Please sign in to confirm your reservation.", "warning");
      setTimeout(() => navigate("/sign-in"), 2000);
      return;
    }
    // Process bookings that don't require payment (like table reservations)
    console.log("Confirming bookings without payment:", items);

    // Save to history
    saveToHistory({
      items: [...items],
      type: "reservation",
      status: "pending confirmation",
    });

    // Show success message
    showToast(
      "Your bookings have been confirmed! We'll contact you shortly.",
      "success"
    );

    // Clear cart after confirmation
    setTimeout(() => {
      clearCart();
    }, 2000);
  };

  const handlePaymentConfirm = (paymentData) => {
    // Process payment with the payment data
    const pricedItems = items.filter(
      (item) => item.price && parseFloat(item.price) > 0
    );
    const unpricedItems = items.filter(
      (item) => !item.price || parseFloat(item.price) <= 0
    );

    console.log("Payment confirmed:", paymentData);
    console.log("Paid items:", pricedItems);

    if (unpricedItems.length > 0) {
      console.log(
        "Unpaid bookings (will be confirmed separately):",
        unpricedItems
      );
    }

    // Save to history
    saveToHistory({
      items: [...items],
      paymentMethod: paymentData.method,
      totalAmount: paymentData.amount,
      type: "payment",
      status: "paid",
    });

    // Show appropriate success message
    const message =
      unpricedItems.length > 0
        ? "Payment successful! We'll confirm your other bookings (table reservations) separately."
        : "Payment successful! Your bookings have been confirmed.";

    showToast(message, "success");

    // Clear cart after successful payment
    setTimeout(() => {
      clearCart();
      setIsPaymentModalOpen(false);
    }, 2000);
  };

  if (cartCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-10 space-y-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header with History Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-semibold text-gray-800">Your cart</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/car-rental-history")}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
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
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              My Car Rentals
            </button>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {showHistory
                ? "Hide History"
                : `View History (${bookingHistory.length})`}
            </button>
          </div>
        </div>

        {/* Booking History Section */}
        {showHistory && bookingHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Booking History
            </h2>
            <div className="space-y-4">
              {bookingHistory.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                            booking.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {booking.status === "paid"
                            ? "✓ Paid"
                            : "⏳ Pending Confirmation"}
                        </span>
                        {booking.paymentMethod !== "N/A" && (
                          <span className="text-xs text-gray-500">
                            via {booking.paymentMethod.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    {booking.totalAmount > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-bold text-green-600">
                          {new Intl.NumberFormat("en-RW", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(booking.totalAmount)}{" "}
                          RWF
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {booking.items.length}{" "}
                      {booking.items.length === 1 ? "item" : "items"}:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {booking.items.map((item, index) => (
                        <li
                          key={`${booking.id}-item-${index}`}
                          className="flex items-start gap-2"
                        >
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear your booking history?"
                  )
                ) {
                  setBookingHistory([]);
                  localStorage.removeItem("travooz-booking-history");
                  showToast("Booking history cleared", "info");
                }
              }}
              className="mt-4 text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Clear History
            </button>
          </div>
        )}

        {showHistory && bookingHistory.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Booking History
            </h3>
            <p className="text-sm text-gray-600">
              Your completed bookings and reservations will appear here.
            </p>
          </div>
        )}

        {/* Empty Cart Message */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-3">
          <h1 className="text-2xl font-semibold text-gray-800">
            Your cart is empty
          </h1>
          <p className="text-gray-600 text-sm">
            Start exploring stays, activities, or restaurants to add bookings to
            your cart.
          </p>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-10 space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header with History Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Your cart</h1>
          <p className="text-gray-600 text-sm">
            {cartCount} {cartCount === 1 ? "item" : "items"} ready to review.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/car-rental-history")}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
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
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
            My Car Rentals
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {showHistory
              ? "Hide History"
              : `View History (${bookingHistory.length})`}
          </button>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Clear cart
          </button>
        </div>
      </div>

      {/* Booking History Section */}
      {showHistory && bookingHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Booking History
          </h2>
          <div className="space-y-4">
            {bookingHistory.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(booking.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                          booking.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {booking.status === "paid"
                          ? "✓ Paid"
                          : "⏳ Pending Confirmation"}
                      </span>
                      {booking.paymentMethod !== "N/A" && (
                        <span className="text-xs text-gray-500">
                          via {booking.paymentMethod.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  {booking.totalAmount > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-bold text-green-600">
                        {new Intl.NumberFormat("en-RW", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(booking.totalAmount)}{" "}
                        RWF
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {booking.items.length}{" "}
                    {booking.items.length === 1 ? "item" : "items"}:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {booking.items.map((item, index) => (
                      <li
                        key={`${booking.id}-item-${index}`}
                        className="flex items-start gap-2"
                      >
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to clear your booking history?"
                )
              ) {
                setBookingHistory([]);
                localStorage.removeItem("travooz-booking-history");
                showToast("Booking history cleared", "info");
              }
            }}
            className="mt-4 text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Clear History
          </button>
        </div>
      )}

      {showHistory && bookingHistory.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Booking History
          </h3>
          <p className="text-sm text-gray-600">
            Your completed bookings and reservations will appear here.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
          >
            <div className="flex-1 space-y-2">
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide text-green-600 bg-green-50 rounded-full px-3 py-1">
                {item.type}
              </span>
              <h2 className="text-lg font-semibold text-gray-800">
                {item.name}
              </h2>
              {item.metadata && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(item.metadata)
                    .filter(
                      ([, value]) =>
                        value !== undefined && value !== null && value !== ""
                    )
                    .map(([key, value]) => (
                      <li key={key}>
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>{" "}
                        <span>{String(value)}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 min-w-[120px]">
              {item.price && parseFloat(item.price) > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat("en-RW", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(parseFloat(item.price))}{" "}
                    {item.currency || "RWF"}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-500">
                      × {item.quantity} ={" "}
                      {new Intl.NumberFormat("en-RW", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(parseFloat(item.price) * item.quantity)}{" "}
                      {item.currency || "RWF"}
                    </p>
                  )}
                </div>
              )}
              {(!item.price || parseFloat(item.price) <= 0) && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Quantity</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {item.quantity}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeItem(item.id, item.type)}
                className="text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary & Checkout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3">
          Order Summary
        </h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Items ({cartCount} {cartCount === 1 ? "item" : "items"})
            </span>
            <span className="font-medium text-gray-800">{cartCount}</span>
          </div>

          {hasPricedItems && (
            <>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">
                  {new Intl.NumberFormat("en-RW", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(totalAmount)}{" "}
                  RWF
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Service Fee</span>
                <span className="font-medium text-gray-800">0 RWF</span>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-800">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat("en-RW", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(totalAmount)}{" "}
                    RWF
                  </span>
                </div>
              </div>
            </>
          )}

          {hasUnpricedItems && !hasPricedItems && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Reservation Request
                  </p>
                  <p className="text-xs text-blue-700">
                    No payment required. Submit your reservation request and
                    we'll contact you to confirm availability and details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasUnpricedItems && hasPricedItems && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    Mixed Cart
                  </p>
                  <p className="text-xs text-amber-700">
                    Your cart contains bookings requiring payment and
                    reservation requests. Use separate buttons below to complete
                    each action.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Button - for priced items */}
        {hasPricedItems && (
          <button
            onClick={handleCheckout}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Complete Payment
          </button>
        )}

        {/* Reservation Request Button - for unpriced items */}
        {hasUnpricedItems && !hasPricedItems && (
          <button
            onClick={handleConfirmBookingsWithoutPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Request Reservation
          </button>
        )}

        {/* Both buttons for mixed carts */}
        {hasPricedItems && hasUnpricedItems && (
          <button
            onClick={handleConfirmBookingsWithoutPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-3"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Also Request Table Reservations
          </button>
        )}

        <p className="text-xs text-center text-gray-500 mt-4">
          {hasPricedItems &&
            !hasUnpricedItems &&
            "By proceeding, you agree to our terms and conditions"}
          {!hasPricedItems &&
            hasUnpricedItems &&
            "No payment required now. We'll contact you to confirm your reservation."}
          {hasPricedItems &&
            hasUnpricedItems &&
            "Complete payment for bookings, then submit your reservation requests."}
        </p>
      </div>

      {/* Payment Modal */}
      <BookingModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingType="cart"
        itemName={`${cartCount} ${cartCount === 1 ? "item" : "items"} in cart`}
        onConfirmBooking={handlePaymentConfirm}
        totalAmount={totalAmount}
        currency="RWF"
      />
    </div>
  );
};

export default Cart;
