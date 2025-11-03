/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import RoomTypeInfo from "../../components/RoomTypeInfo";
import { useCart } from "../../context/useCart";
import BookingModal from "../../components/BookingModal";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/useAuth";
import GuestInfoModal from "../../components/GuestInfoModal";

const toISODate = (d) => {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

// Helpers for date limits
const todayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDaysISO = (iso, days) => {
  try {
    const base = new Date(iso);
    if (Number.isNaN(base.getTime())) return "";
    base.setDate(base.getDate() + days);
    return base.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const RoomTypeDetails = () => {
  const { roomTypeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state || {};
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dateError, setDateError] = useState("");
  const [toast, setToast] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingItem, setBookingItem] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'add' | 'book'
  const [pendingItem, setPendingItem] = useState(null);
  const [guestInfo, setGuestInfo] = useState(null);
  const [bookedInventoryIds, setBookedInventoryIds] = useState([]);
  const [bookedRoomNumbers, setBookedRoomNumbers] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Persist and restore recent bookings so coming back to this page shows occupied
  const STORAGE_KEY = "travooz-recent-bookings";

  const addRecentBooking = (payload) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const arr = stored ? JSON.parse(stored) : [];
      const entry = {
        roomTypeId: String(payload.roomTypeId || roomTypeId),
        inventoryId: payload.inventoryId ?? null,
        roomNumber: payload.roomNumber ?? null,
        startDate: payload.startDate || checkIn,
        endDate: payload.endDate || checkOut,
        ts: Date.now(),
      };
      const next = [entry, ...arr].slice(0, 200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const loadRecentForCurrent = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const arr = stored ? JSON.parse(stored) : [];
      const now = Date.now();
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const filtered = arr.filter(
        (it) =>
          it &&
          String(it.roomTypeId) === String(roomTypeId) &&
          it.startDate === checkIn &&
          it.endDate === checkOut &&
          now - (it.ts || 0) < weekMs
      );
      const ids = Array.from(
        new Set(
          filtered
            .map((it) => it.inventoryId)
            .filter((v) => v !== null && v !== undefined)
        )
      );
      const nums = Array.from(
        new Set(
          filtered
            .map((it) => it.roomNumber)
            .filter((v) => v !== null && v !== undefined)
        )
      );
      setBookedInventoryIds(ids);
      setBookedRoomNumbers(nums);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Prefill dates if passed from previous page and auto-submit
    const ci = fromState.checkIn ? toISODate(fromState.checkIn) : "";
    const co = fromState.checkOut ? toISODate(fromState.checkOut) : "";
    console.log("RoomTypeDetails - Received dates:", { ci, co, fromState });
    if (ci) setCheckIn(ci);
    if (co) setCheckOut(co);
    if (ci && co) {
      setSubmitted(true);
      setShowAvailabilityModal(true); // Auto-open modal when dates provided
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload recent bookings for this room type and date range
  useEffect(() => {
    if (roomTypeId && checkIn && checkOut) {
      loadRecentForCurrent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomTypeId, checkIn, checkOut, submitted]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showAvailabilityModal) {
        setShowAvailabilityModal(false);
      }
    };

    if (showAvailabilityModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showAvailabilityModal]);

  // Listen for global booking events (e.g., booked via cart) and update local state
  useEffect(() => {
    const handleBooked = (e) => {
      try {
        const ids = Array.isArray(e?.detail?.inventoryIds)
          ? e.detail.inventoryIds
          : [];
        const nums = Array.isArray(e?.detail?.roomNumbers)
          ? e.detail.roomNumbers
          : [];
        if (ids.length > 0 || nums.length > 0) {
          setBookedInventoryIds((prev) => {
            const set = new Set(prev);
            ids.forEach((id) => set.add(id));
            return Array.from(set);
          });
          setBookedRoomNumbers((prev) => {
            const set = new Set(prev);
            nums.forEach((n) => set.add(n));
            return Array.from(set);
          });
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("travooz:booked", handleBooked);
    return () => window.removeEventListener("travooz:booked", handleBooked);
  }, []);

  // Validate date range
  useEffect(() => {
    setDateError("");
    const today = todayISO();

    if (checkIn && new Date(checkIn) < new Date(today)) {
      setDateError("Check-in date cannot be in the past");
      return;
    }

    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      setDateError("Check-out date must be after check-in date");
      return;
    }
  }, [checkIn, checkOut]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    if (dateError) return;
    setSubmitted(true);
    setShowAvailabilityModal(true);
  };

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleAddToCart = (item) => {
    if (!checkIn || !checkOut) {
      showToast("Select dates first", "warning");
      return;
    }
    if (!isAuthenticated) {
      setPendingAction("add");
      setPendingItem(item);
      setShowGuestForm(true);
      return;
    }
    addItem(item);
    showToast("Added to cart", "success");
  };

  const handleBookNow = (item) => {
    if (!checkIn || !checkOut) {
      showToast("Select dates first", "warning");
      return;
    }
    if (!isAuthenticated) {
      setPendingAction("book");
      setPendingItem(item);
      setShowGuestForm(true);
      return;
    }
    setBookingItem(item);
    setPaymentConfirmed(false);
    setShowPayment(true);
  };

  const saveToHistory = (paymentData) => {
    try {
      const key = "travooz-booking-history";
      const stored = localStorage.getItem(key);
      const history = stored ? JSON.parse(stored) : [];
      const entry = {
        id: `booking-${Date.now()}`,
        date: new Date().toISOString(),
        items: bookingItem ? [bookingItem] : [],
        paymentMethod: paymentData.method,
        totalAmount: paymentData.amount,
        status: "paid",
        type: "payment",
      };
      const updated = [entry, ...history];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist booking history", e);
    }
  };

  const hotelName = fromState.hotelName;
  const roomName = fromState.roomName;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center space-x-2 text-sm">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-700"
        >
          Home
        </button>
        <span className="text-gray-400">/</span>
        <button
          onClick={() => navigate("/hotels")}
          className="text-green-600 hover:text-green-700"
        >
          Hotels
        </button>
        {fromState.hotelId && (
          <>
            <span className="text-gray-400">/</span>
            <button
              onClick={() => navigate(`/hotel/${fromState.hotelId}`)}
              className="text-green-600 hover:text-green-700"
            >
              {hotelName || "Hotel"}
            </button>
          </>
        )}
        <span className="text-gray-400">/</span>
        <span className="text-gray-700">
          {roomName || `Room Type ${roomTypeId}`}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {roomName || "Room Type"}
        </h1>
        {hotelName && <p className="text-sm text-gray-500">at {hotelName}</p>}
      </div>

      {/* Date selection form (hidden if dates came from previous page) */}
      {!(fromState.checkIn && fromState.checkOut) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={todayISO()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn ? addDaysISO(checkIn, 1) : todayISO()}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!checkIn || !checkOut || Boolean(dateError)}
                className={`w-full sm:w-auto px-4 py-3 rounded-lg font-semibold text-white ${
                  !checkIn || !checkOut || Boolean(dateError)
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Check Availability
              </button>
            </div>
          </div>
          {dateError && (
            <p className="mt-3 text-sm text-red-600">{dateError}</p>
          )}
        </form>
      )}

      {/* Availability Modal with Blur */}
      {showAvailabilityModal &&
        submitted &&
        checkIn &&
        checkOut &&
        !dateError && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvailabilityModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  Room Availability
                </h2>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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

              {/* Modal Content */}
              <div className="p-6">
                <RoomTypeInfo
                  roomTypeId={roomTypeId}
                  startDate={checkIn}
                  endDate={checkOut}
                  onAddToCart={handleAddToCart}
                  onBookNow={handleBookNow}
                />
              </div>
            </div>
          </div>
        )}

      <BookingModal
        isOpen={showPayment}
        onClose={() => {
          // If user cancels/closes without confirming payment, revert optimistic mark
          if (!paymentConfirmed && bookingItem?.metadata) {
            try {
              const invId = bookingItem.metadata.inventoryId;
              const roomNum = bookingItem.metadata.roomNumber;
              window.dispatchEvent(
                new CustomEvent("travooz:booking-cancelled", {
                  detail: {
                    inventoryIds: invId ? [invId] : [],
                    roomNumbers: roomNum ? [roomNum] : [],
                  },
                })
              );
            } catch {
              // ignore
            }
          }
          setShowPayment(false);
          setBookingItem(null);
          setPaymentConfirmed(false);
        }}
        bookingType="room"
        itemName={bookingItem?.name || "Room Booking"}
        onConfirmBooking={(paymentData) => {
          // Attach guest info to history item if present
          if (guestInfo && bookingItem) {
            bookingItem.metadata = {
              ...(bookingItem.metadata || {}),
              guestFirstName: guestInfo.firstName,
              guestEmail: guestInfo.email,
              guestPhone: guestInfo.phone,
              guestRequest: guestInfo.specialRequest,
            };
          }
          saveToHistory(paymentData);
          setPaymentConfirmed(true);
          // Real-time local update for booked room
          const invId = bookingItem?.metadata?.inventoryId;
          const roomNum = bookingItem?.metadata?.roomNumber;
          if (invId || roomNum) {
            setBookedInventoryIds((prev) =>
              invId && !prev.includes(invId) ? [...prev, invId] : prev
            );
            setBookedRoomNumbers((prev) =>
              roomNum && !prev.includes(roomNum) ? [...prev, roomNum] : prev
            );
            // Persist to storage so returning to this page shows it occupied
            addRecentBooking({
              roomTypeId,
              inventoryId: invId,
              roomNumber: roomNum,
              startDate: checkIn,
              endDate: checkOut,
            });
            // Optional: broadcast globally (other pages/tabs)
            try {
              window.dispatchEvent(
                new CustomEvent("travooz:booked", {
                  detail: {
                    inventoryIds: invId ? [invId] : [],
                    roomNumbers: roomNum ? [roomNum] : [],
                  },
                })
              );
            } catch {
              // ignore broadcast errors
            }
          }
          setShowPayment(false);
          showToast(
            "Payment successful! Your booking is confirmed.",
            "success"
          );
        }}
        totalAmount={bookingItem?.price || 0}
        currency={bookingItem?.currency || "RWF"}
      />

      {/* Guest Info Modal for unauthenticated users (stays only) */}
      <GuestInfoModal
        isOpen={showGuestForm}
        onClose={() => {
          setShowGuestForm(false);
          setPendingAction(null);
          setPendingItem(null);
        }}
        itemName={pendingItem?.name}
        onSubmit={(values) => {
          setGuestInfo(values);
          setShowGuestForm(false);
          if (pendingAction === "add" && pendingItem) {
            const itemWithGuest = {
              ...pendingItem,
              metadata: {
                ...(pendingItem.metadata || {}),
                guestFirstName: values.firstName,
                guestEmail: values.email,
                guestPhone: values.phone,
                guestRequest: values.specialRequest,
              },
            };
            addItem(itemWithGuest);
            showToast("Added to cart", "success");
          }
          if (pendingAction === "book" && pendingItem) {
            setBookingItem({
              ...pendingItem,
              metadata: {
                ...(pendingItem.metadata || {}),
                guestFirstName: values.firstName,
                guestEmail: values.email,
                guestPhone: values.phone,
                guestRequest: values.specialRequest,
              },
            });
            setShowPayment(true);
          }
          setPendingAction(null);
          setPendingItem(null);
        }}
      />
    </div>
  );
};

export default RoomTypeDetails;
