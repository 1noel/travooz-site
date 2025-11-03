import React, { useEffect, useMemo, useState } from "react";
import { homestayServices } from "../api/homestays";

/**
 * RoomTypeInfo
 * Displays detailed info and availability for a specific room type within a date range.
 * Uses ONLY real API data - refreshes every 15 seconds for live updates.
 *
 * Props:
 * - roomTypeId: number|string (required)
 * - startDate: string YYYY-MM-DD (required)
 * - endDate: string YYYY-MM-DD (required)
 * - onAddToCart?: function(cartItem)
 * - onBookNow?: function(cartItem)
 */
const RoomTypeInfo = ({
  roomTypeId,
  startDate,
  endDate,
  onAddToCart,
  onBookNow,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const hasDates = Boolean(startDate && endDate);

  const imageUrls = useMemo(() => {
    if (!data?.images || !Array.isArray(data.images)) return [];
    return data.images
      .map((img) =>
        img?.image_path ? `https://travoozapp.com/${img.image_path}` : null
      )
      .filter(Boolean);
  }, [data]);

  const mainImage = imageUrls[0] || "/images/rm1.jpg";

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return value ?? "";
    try {
      return new Intl.NumberFormat("en-RW", {
        style: "currency",
        currency: "RWF",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return `${num}`;
    }
  };

  // Use ONLY real API data - no UI overlays
  const derivedRoomDetails = useMemo(() => {
    if (!Array.isArray(data?.room_details)) return [];
    // Return API data as-is, no modifications
    return data.room_details;
  }, [data]);

  const availability = useMemo(() => {
    // Use API availability summary directly
    return data?.availability_summary || {};
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    let pollInterval = null;

    const fetchData = async (isPolling = false) => {
      if (!roomTypeId || !hasDates) return;

      // Only show loading on initial fetch, not during polling
      if (!isPolling) {
        setLoading(true);
        setError(null);
        setData(null);
      }

      const res = await homestayServices.getRoomTypeAvailability({
        roomTypeId,
        startDate,
        endDate,
      });

      if (cancelled) return;

      if (res.success) {
        setData(res.data);
        setLastFetched(new Date().toISOString());
      } else {
        setError(res.error || "Failed to load room availability");
      }

      if (!isPolling) {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData(false);

    // Poll API every 15 seconds for real-time updates
    pollInterval = setInterval(() => {
      fetchData(true);
    }, 15000); // 15 seconds

    return () => {
      cancelled = true;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [roomTypeId, startDate, endDate, hasDates]);

  // No optimistic mark; no cancel listener required

  if (!roomTypeId) {
    return (
      <div className="p-6 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg shadow-sm">
        <div className="text-center">
          <p className="font-medium">Room type missing.</p>
        </div>
      </div>
    );
  }

  if (!hasDates) {
    return (
      <div className="p-6 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg shadow-sm">
        <div className="text-center">
          <p className="font-medium">
            Select check-in and check-out dates to view availability details.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg" />
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-sm">
        <div className="text-center">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const basePrice =
    data?.base_price != null ? parseFloat(data.base_price) : null;

  const buildCartItem = (rd) => {
    const uniqueId = `rt-${data.room_type_id || roomTypeId}-inv-${
      rd.inventory_id
    }-${startDate}-${endDate}`;
    return {
      id: uniqueId,
      type: "room",
      name: `${data.homestay_name || "Homestay"} • ${data.room_type || "Room"}${
        rd?.room_number ? ` • #${rd.room_number}` : ""
      }`,
      price: basePrice || 0,
      currency: "RWF",
      quantity: 1,
      metadata: {
        roomTypeId: data.room_type_id || roomTypeId,
        inventoryId: rd.inventory_id,
        roomNumber: rd.room_number,
        homestayId: data.homestay_id,
        homestayName: data.homestay_name,
        checkIn: startDate,
        checkOut: endDate,
      },
    };
  };

  // No optimistic mark function; update happens after confirm via props

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header / Cover */}
      <div className="relative">
        <img
          src={mainImage}
          alt={data.room_type || "Room Type"}
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h3 className="text-white text-xl font-bold mb-1">
            {data.room_type}
            {data.size_sqm && (
              <span className="text-sm text-white/90 font-normal ml-2">
                • {data.size_sqm} m²
              </span>
            )}
          </h3>
          {data.homestay_name && (
            <p className="text-white/90 text-sm font-medium">
              {data.homestay_name}
            </p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Row with Live Status */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                availability.available_rooms > 0
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {availability.available_rooms > 0 ? "Available" : "Not Available"}
            </span>
            {availability.total_rooms != null && (
              <span className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 border border-gray-200">
                Total: {availability.total_rooms}
              </span>
            )}
            {availability.available_rooms != null && (
              <span className="px-3 py-1.5 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
                Available: {availability.available_rooms}
              </span>
            )}
            {availability.occupied_rooms != null && (
              <span className="px-3 py-1.5 rounded-full text-sm bg-amber-50 text-amber-700 border border-amber-200">
                Occupied: {availability.occupied_rooms}
              </span>
            )}
          </div>

          {/* Live Update Indicator */}
          {lastFetched && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>
                Live updates • Last refreshed:{" "}
                {new Date(lastFetched).toLocaleTimeString()}
              </span>
              <span className="text-gray-400">• Auto-refreshes every 15s</span>
            </div>
          )}
        </div>

        {/* Meta Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Base Price
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(data.base_price)}
            </div>
          </div>
          {data.max_occupancy != null && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Max Occupancy
              </div>
              <div className="text-lg font-bold text-gray-900">
                {data.max_occupancy}
              </div>
            </div>
          )}
          {data.size_sqm != null && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Size
              </div>
              <div className="text-lg font-bold text-gray-900">
                {data.size_sqm} m²
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{data.description}</p>
          </div>
        )}

        {/* Gallery */}
        {imageUrls.length > 1 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Gallery
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {imageUrls.slice(1, 7).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Room image ${i + 2}`}
                  className="w-full h-24 object-cover rounded-lg shadow-sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Room details list */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Room Availability
          </h4>
          {Array.isArray(derivedRoomDetails) &&
          derivedRoomDetails.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Room #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Housekeeping
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Check-in
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Check-out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Available
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {derivedRoomDetails.map((rd) => (
                      <tr
                        key={rd.inventory_id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          {rd.room_number}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                              rd.current_status === "available"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : rd.current_status === "occupied"
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {rd.current_status || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {rd.room_status || "—"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {rd.check_in_date || startDate || "—"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {rd.check_out_date || endDate || "—"}
                        </td>
                        <td className="px-4 py-4">
                          {rd.is_available ? (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600 border border-red-200">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              disabled={!rd.is_available || !basePrice}
                              onClick={(e) => {
                                e.preventDefault();
                                if (typeof onAddToCart === "function") {
                                  onAddToCart(buildCartItem(rd));
                                }
                              }}
                            >
                              Add to Cart
                            </button>
                            <button
                              type="button"
                              className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              disabled={!rd.is_available || !basePrice}
                              onClick={(e) => {
                                e.preventDefault();
                                if (typeof onBookNow === "function") {
                                  onBookNow(buildCartItem(rd));
                                }
                              }}
                            >
                              Book Now
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm">
                No room details available for this date range.
              </p>
            </div>
          )}
        </div>

        {/* Date range footer */}
        {data.date_range && (
          <div className="text-sm text-gray-500 text-center py-3 border-t border-gray-100">
            Date range: {data.date_range.start} → {data.date_range.end}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomTypeInfo;
