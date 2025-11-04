import React, { useState } from "react";
import { useCart } from "../../context/useCart";
import { useNavigate } from "react-router-dom";
import BookingModal from "../../components/BookingModal";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/useAuth";
import GuestInfoModal from "../../components/GuestInfoModal";

const Cart = () => {
  const { items, cartCount, clearCart, removeItem, updateItemMetadata } =
    useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // 'paid' | 'reservation'
  const [showItemGuestForm, setShowItemGuestForm] = useState(false);
  const [itemForGuestEdit, setItemForGuestEdit] = useState(null); // {id, type, name, metadata}
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

  // In-memory session holds for fake occupied (reset on refresh)
  const addSessionHold = (invId, roomNum) => {
    try {
      const gh = (window.__travoozSessionHolds ||= {
        inventoryIds: new Set(),
        roomNumbers: new Set(),
      });
      if (invId) gh.inventoryIds.add(String(invId));
      if (roomNum) gh.roomNumbers.add(String(roomNum));
    } catch {
      // ignore
    }
  };
  const releaseSessionHold = (invId, roomNum) => {
    try {
      const gh = (window.__travoozSessionHolds ||= {
        inventoryIds: new Set(),
        roomNumbers: new Set(),
      });
      if (invId) gh.inventoryIds.delete(String(invId));
      if (roomNum) gh.roomNumbers.delete(String(roomNum));
    } catch {
      // ignore
    }
  };

  // Cart-only holds store (used for the "in your cart" badge). We'll clear these on payment.
  const releaseCartHold = (invId, roomNum) => {
    try {
      const ch = (window.__travoozSessionCartHolds ||= {
        inventoryIds: new Set(),
        roomNumbers: new Set(),
      });
      if (invId) ch.inventoryIds.delete(String(invId));
      if (roomNum) ch.roomNumbers.delete(String(roomNum));
    } catch {
      // ignore
    }
  };

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

  const deriveGuestInfoFromItems = () => {
    for (const it of items) {
      const md = it.metadata || {};
      if (md.guestEmail || md.guestPhone || md.guestFirstName) {
        return {
          firstName: md.guestFirstName || "",
          email: md.guestEmail || "",
          phone: md.guestPhone || "",
          specialRequest: md.guestRequest || "",
        };
      }
    }
    return null;
  };

  const handleCheckout = () => {
    if (cartCount === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    // If not authenticated, collect minimal guest info then continue
    if (!isAuthenticated) {
      if (!guestInfo) {
        const derived = deriveGuestInfoFromItems();
        if (derived) {
          setGuestInfo(derived);
        } else {
          setPendingAction("paid");
          setShowGuestForm(true);
          return;
        }
      }
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
    if (cartCount === 0) {
      showToast("Your cart is empty", "error");
      return;
    }
    if (!isAuthenticated) {
      if (!guestInfo) {
        const derived = deriveGuestInfoFromItems();
        if (derived) {
          setGuestInfo(derived);
        } else {
          setPendingAction("reservation");
          setShowGuestForm(true);
          return;
        }
      }
    }
    // Process bookings that don't require payment (like table reservations)
    console.log("Confirming bookings without payment:", items);

    // Save to history
    // Attach guest info metadata if present
    const itemsWithGuest = items.map((it) => ({
      ...it,
      metadata: {
        ...(it.metadata || {}),
        ...(guestInfo
          ? {
              guestFirstName: guestInfo.firstName,
              guestEmail: guestInfo.email,
              guestPhone: guestInfo.phone,
              guestRequest: guestInfo.specialRequest,
            }
          : {}),
      },
    }));

    saveToHistory({
      items: itemsWithGuest,
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

    // Attach guest info metadata if present
    const itemsWithGuest = items.map((it) => ({
      ...it,
      metadata: {
        ...(it.metadata || {}),
        ...(guestInfo
          ? {
              guestFirstName: guestInfo.firstName,
              guestEmail: guestInfo.email,
              guestPhone: guestInfo.phone,
              guestRequest: guestInfo.specialRequest,
            }
          : {}),
      },
    }));

    // Save to history
    saveToHistory({
      items: itemsWithGuest,
      paymentMethod: paymentData.method,
      totalAmount: paymentData.amount,
      type: "payment",
      status: "paid",
    });

    // Broadcast booking event for any room inventory booked (real-time UI updates)
    try {
      const bookedRooms = itemsWithGuest.filter((it) => it.type === "room");
      const bookedIds = bookedRooms
        .map((it) => it.metadata?.inventoryId)
        .filter(Boolean);
      const roomNumbers = bookedRooms
        .map((it) => it.metadata?.roomNumber)
        .filter(Boolean);
      if (bookedIds.length > 0 || roomNumbers.length > 0) {
        // Keep session holds so other pages in this session reflect fake occupied
        bookedRooms.forEach((it) => {
          const inv = it.metadata?.inventoryId;
          const num = it.metadata?.roomNumber;
          addSessionHold(inv, num);
          // Remove any cart-only hold badges now that it's paid
          releaseCartHold(inv, num);
        });
        window.dispatchEvent(
          new CustomEvent("travooz:booked", {
            detail: { inventoryIds: bookedIds, roomNumbers, source: "paid" },
          })
        );
      }
    } catch {
      // ignore broadcast errors
    }

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          {/* Modern Header */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Your Cart
                  </h1>
                  <p className="text-sm text-gray-500">
                    Your travel bookings and reservations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/car-rental-history")}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow hover:shadow-sm"
                >
                  Car Rentals
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 shadow hover:shadow-sm"
                >
                  {showHistory
                    ? "Hide History"
                    : `History (${bookingHistory.length})`}
                </button>
              </div>
            </div>
          </div>

          {/* Booking History Section */}
          {showHistory && bookingHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
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
            <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center">
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
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Discover amazing hotels, restaurants, activities, and car rentals.
              Start exploring and add items to your cart.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 shadow hover:shadow-sm"
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Browse Hotels
              </button>
              <button
                onClick={() => navigate("/eating-out")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 shadow hover:shadow-sm"
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Find Restaurants
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
                <p className="text-sm text-gray-500">
                  {cartCount} {cartCount === 1 ? "item" : "items"} ready for
                  checkout
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/car-rental-history")}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow hover:shadow-sm"
              >
                Car Rentals
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 shadow hover:shadow-sm"
              >
                {showHistory
                  ? "Hide History"
                  : `History (${bookingHistory.length})`}
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Booking History Section */}
        {showHistory && bookingHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
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
          <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white rounded-xl shadow border border-gray-100 p-4 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  {/* Item Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span
                          className={`inline-flex items-center text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                            item.type === "food"
                              ? "text-orange-700 bg-orange-100"
                              : item.type === "hotel"
                              ? "text-blue-700 bg-blue-100"
                              : item.type === "restaurant"
                              ? "text-purple-700 bg-purple-100"
                              : item.type === "car"
                              ? "text-red-700 bg-red-100"
                              : "text-green-700 bg-green-100"
                          }`}
                        >
                          {item.type}
                        </span>
                        <h3 className="text-base font-semibold text-gray-900 mt-1 leading-tight">
                          {item.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // If removing a room from cart, release the local hold so it shows available again
                          try {
                            if (item.type === "room") {
                              const invId = item?.metadata?.inventoryId;
                              const roomNum = item?.metadata?.roomNumber;
                              if (invId || roomNum) {
                                releaseSessionHold(invId, roomNum);
                                window.dispatchEvent(
                                  new CustomEvent("travooz:booking-cancelled", {
                                    detail: {
                                      inventoryIds: invId ? [invId] : [],
                                      roomNumbers: roomNum ? [roomNum] : [],
                                    },
                                  })
                                );
                              }
                            }
                          } catch {
                            // ignore broadcast errors
                          }
                          removeItem(item.id, item.type);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Item Details */}
                    {item.metadata && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {Object.entries(item.metadata)
                          .filter(
                            ([key, value]) =>
                              value !== undefined &&
                              value !== null &&
                              value !== "" &&
                              !key.toLowerCase().includes("checkin") &&
                              !key.toLowerCase().includes("checkout") &&
                              !key.toLowerCase().includes("check-in") &&
                              !key.toLowerCase().includes("check-out") &&
                              !key.toLowerCase().includes("arrival") &&
                              !key.toLowerCase().includes("departure") &&
                              // hide internal identifiers from the quick details view
                              ![
                                "roomtypeid",
                                "inventoryid",
                                "homestayid",
                              ].includes(key.toLowerCase())
                          )
                          .slice(0, 4) // Limit to 4 most important details
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center gap-1 text-xs"
                            >
                              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full flex-shrink-0"></span>
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <span className="text-gray-600 truncate">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Guest Info quick view and edit */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-600">
                        {item.metadata?.guestEmail ||
                        item.metadata?.guestFirstName ||
                        item.metadata?.guestPhone ? (
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                              Guest info added
                            </span>
                            <span className="text-gray-500">
                              {item.metadata?.guestFirstName}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 truncate max-w-[160px]">
                              {item.metadata?.guestEmail}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No guest info</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setItemForGuestEdit({
                            id: item.id,
                            type: item.type,
                            name: item.name,
                            metadata: item.metadata || {},
                          });
                          setShowItemGuestForm(true);
                        }}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                      >
                        {item.metadata?.guestEmail ||
                        item.metadata?.guestFirstName ||
                        item.metadata?.guestPhone
                          ? "View / Edit info"
                          : "Add guest info"}
                      </button>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between">
                      {item.price && parseFloat(item.price) > 0 ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {new Intl.NumberFormat("en-RW", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(parseFloat(item.price))}{" "}
                              <span className="text-sm text-gray-600">
                                {item.currency || "RWF"}
                              </span>
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500">
                                × {item.quantity} ={" "}
                                {new Intl.NumberFormat("en-RW", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(
                                  parseFloat(item.price) * item.quantity
                                )}{" "}
                                {item.currency || "RWF"}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">
                            Quantity:
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                          <span className="text-xs font-medium text-gray-700">
                            {item.quantity}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow border border-gray-100 p-4 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-600">
                    Items ({cartCount})
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {cartCount}
                  </span>
                </div>

                {hasPricedItems && (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat("en-RW", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(totalAmount)}{" "}
                        RWF
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">Service Fee</span>
                      <span className="text-sm font-semibold text-green-600">
                        Free
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-lg font-bold text-green-600">
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
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Reservation Request
                        </p>
                        <p className="text-xs text-blue-700">
                          No payment required. We'll contact you to confirm
                          availability.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {hasUnpricedItems && hasPricedItems && (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">
                          Mixed Cart
                        </p>
                        <p className="text-xs text-amber-700">
                          Contains both paid bookings and reservation requests.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {/* Payment Button - for priced items */}
                {hasPricedItems && (
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-medium py-3 rounded-lg transition-all duration-200 shadow hover:shadow-sm flex items-center justify-center gap-1"
                  >
                    Complete Payment
                  </button>
                )}

                {/* Reservation Request Button - for unpriced items */}
                {hasUnpricedItems && !hasPricedItems && (
                  <button
                    onClick={handleConfirmBookingsWithoutPayment}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium py-3 rounded-lg transition-all duration-200 shadow hover:shadow-sm flex items-center justify-center gap-1"
                  >
                    Request Reservation
                  </button>
                )}

                {/* Both buttons for mixed carts */}
                {hasPricedItems && hasUnpricedItems && (
                  <button
                    onClick={handleConfirmBookingsWithoutPayment}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-medium py-3 rounded-lg transition-all duration-200 shadow hover:shadow-sm flex items-center justify-center gap-1"
                  >
                    Also Request Reservations
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>Secure checkout protected by SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <BookingModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          bookingType="cart"
          itemName={`${cartCount} ${
            cartCount === 1 ? "item" : "items"
          } in cart`}
          onConfirmBooking={handlePaymentConfirm}
          totalAmount={totalAmount}
          currency="RWF"
        />

        {/* Guest Info Modal for unauthenticated checkout/reservation */}
        <GuestInfoModal
          isOpen={showGuestForm}
          onClose={() => {
            setShowGuestForm(false);
            setPendingAction(null);
          }}
          itemName={`${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          onSubmit={(values) => {
            setGuestInfo(values);
            setShowGuestForm(false);
            if (pendingAction === "paid") {
              setIsPaymentModalOpen(true);
            }
            if (pendingAction === "reservation") {
              // re-run reservation now that we have guest info
              handleConfirmBookingsWithoutPayment();
            }
            setPendingAction(null);
          }}
        />

        {/* Per-item Guest Info Modal (view/edit) */}
        <GuestInfoModal
          isOpen={showItemGuestForm}
          onClose={() => {
            setShowItemGuestForm(false);
            setItemForGuestEdit(null);
          }}
          itemName={itemForGuestEdit?.name}
          initialData={
            itemForGuestEdit
              ? {
                  firstName: itemForGuestEdit.metadata?.guestFirstName || "",
                  email: itemForGuestEdit.metadata?.guestEmail || "",
                  phone: itemForGuestEdit.metadata?.guestPhone || "",
                  specialRequest: itemForGuestEdit.metadata?.guestRequest || "",
                }
              : undefined
          }
          onSubmit={(values) => {
            if (itemForGuestEdit) {
              updateItemMetadata(itemForGuestEdit.id, itemForGuestEdit.type, {
                guestFirstName: values.firstName,
                guestEmail: values.email,
                guestPhone: values.phone,
                guestRequest: values.specialRequest,
              });
              // Use this as cart-level guest info if not set yet
              if (!guestInfo) setGuestInfo(values);
            }
            setShowItemGuestForm(false);
            setItemForGuestEdit(null);
            showToast("Guest info saved for item", "success");
          }}
        />
      </div>
    </div>
  );
};

export default Cart;
