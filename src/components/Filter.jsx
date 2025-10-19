import { useEffect, useMemo, useRef, useState } from "react";
import { useFilterContext } from "../context/useFilterContext";
import { useLocationSuggestions } from "../hooks/useLocationSuggestions";
import Toast from "./Toast";

const FILTER_CONFIGS = {
  restStay: {
    key: "restStay",
    destinationLabel: "Destination",
    destinationPlaceholder: "Where are you going?",
    checkInLabel: "Check-in",
    checkInPlaceholder: "Select date",
    checkInFieldType: "date",
    checkOutLabel: "Check-out",
    checkOutPlaceholder: "Select date",
    checkOutFieldType: "date",
    dropdownLabel: "Guests",
    dropdownDefault: "2 Guests",
    dropdownOptions: [
      "1 Guest",
      "2 Guests",
      "3 Guests",
      "4 Guests",
      "5+ Guests",
    ],
    searchButtonText: "Search Stays",
  },
  carRental: {
    key: "carRental",
    destinationLabel: "Pick-up location",
    destinationPlaceholder: "City or airport",
    checkInLabel: "Pick-up date",
    checkInPlaceholder: "Select date",
    checkInFieldType: "date",
    checkOutLabel: "Drop-off date",
    checkOutPlaceholder: "Select date",
    checkOutFieldType: "date",
    dropdownLabel: "Passengers",
    dropdownDefault: "2 Passengers",
    dropdownOptions: [
      "1 Passenger",
      "2 Passengers",
      "3 Passengers",
      "4 Passengers",
      "5+ Passengers",
    ],
    searchButtonText: "Find Cars",
  },
  eatingOut: {
    key: "eatingOut",
    destinationLabel: "Restaurant or cuisine",
    destinationPlaceholder: "Search for a restaurant",
    checkInLabel: "Reservation date",
    checkInPlaceholder: "Select date",
    checkInFieldType: "date",
    checkOutLabel: "Reservation time",
    checkOutPlaceholder: "e.g. 7:30 PM",
    checkOutFieldType: "text",
    dropdownLabel: "Guests",
    dropdownDefault: "2 Guests",
    dropdownOptions: [
      "1 Guest",
      "2 Guests",
      "3 Guests",
      "4 Guests",
      "5+ Guests",
    ],
    searchButtonText: "Find Tables",
  },
  activities: {
    key: "activities",
    destinationLabel: "Activity or location",
    destinationPlaceholder: "Search activities",
    checkInLabel: "Start date",
    checkInPlaceholder: "Select date",
    checkInFieldType: "date",
    checkOutLabel: "End date",
    checkOutPlaceholder: "Select date",
    checkOutFieldType: "date",
    dropdownLabel: "Travelers",
    dropdownDefault: "2 Travelers",
    dropdownOptions: [
      "1 Traveler",
      "2 Travelers",
      "3 Travelers",
      "4 Travelers",
      "5+ Travelers",
    ],
    searchButtonText: "Find Activities",
  },
  tourPackages: {
    key: "tourPackages",
    destinationLabel: "Destination",
    destinationPlaceholder: "Where to?",
    checkInLabel: "Start date",
    checkInPlaceholder: "Select date",
    checkInFieldType: "date",
    checkOutLabel: "End date",
    checkOutPlaceholder: "Select date",
    checkOutFieldType: "date",
    dropdownLabel: "Travelers",
    dropdownDefault: "2 Travelers",
    dropdownOptions: [
      "1 Traveler",
      "2 Travelers",
      "3 Travelers",
      "4 Travelers",
      "5+ Travelers",
    ],
    searchButtonText: "Explore Tours",
  },
};

FILTER_CONFIGS.default = FILTER_CONFIGS.restStay;

const DISPLAY_DATE_OPTIONS = {
  weekday: "short",
  month: "short",
  day: "numeric",
};

const normalizeToStartOfDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseInputDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return normalizeToStartOfDay(value);
  }

  if (typeof value === "string") {
    const isoSegments = value.split("-");
    if (isoSegments.length === 3) {
      const [yearPart, monthPart, dayPart] = isoSegments;
      const year = Number(yearPart);
      const month = Number(monthPart) - 1;
      const day = Number(dayPart);
      const parsed = new Date(year, month, day);

      if (
        !Number.isNaN(parsed.getTime()) &&
        parsed.getFullYear() === year &&
        parsed.getMonth() === month &&
        parsed.getDate() === day
      ) {
        return normalizeToStartOfDay(parsed);
      }
    }

    const fallback = new Date(value);
    if (!Number.isNaN(fallback.getTime())) {
      return normalizeToStartOfDay(fallback);
    }
  }

  return null;
};

const formatDateForStorage = (value) => {
  const date = parseInputDate(value);
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (value) => {
  const date = parseInputDate(value);
  if (!date) return "";

  return date.toLocaleDateString(undefined, DISPLAY_DATE_OPTIONS);
};

const isSameDay = (left, right) => {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const isDateBefore = (left, right) => {
  if (!left || !right) return false;
  return left.getTime() < right.getTime();
};

const getInitialCalendarState = (dateLike) => {
  const base = parseInputDate(dateLike) ?? new Date();
  return {
    month: base.getMonth(),
    year: base.getFullYear(),
  };
};

const getInitialDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return formatDateForStorage(date);
};

const Filter = () => {
  const { activeCategory, applyFilters, clearFilters } = useFilterContext();

  const config = useMemo(
    () => FILTER_CONFIGS[activeCategory] ?? FILTER_CONFIGS.default,
    [activeCategory]
  );

  const initialValues = useMemo(() => {
    const checkOut = config.key === "eatingOut" ? "" : getInitialDate(1);
    return {
      destination: "",
      checkIn: getInitialDate(0),
      checkOut: checkOut,
      guests: config.dropdownDefault ?? config.dropdownOptions?.[0] ?? "",
    };
  }, [config]);

  const [selectedAdults, setSelectedAdults] = useState(initialValues.guests);
  const [showAdultsDropdown, setShowAdultsDropdown] = useState(false);
  const [locationInputValue, setLocationInputValue] = useState(
    initialValues.destination
  );
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState(null);
  const {
    suggestions: locationSuggestions,
    isLoading: isLoadingLocations,
    isEnabled: isLocationSuggestionsEnabled,
  } = useLocationSuggestions(activeCategory);
  const [checkInValue, setCheckInValue] = useState(initialValues.checkIn);
  const [checkOutValue, setCheckOutValue] = useState(initialValues.checkOut);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarState, setCalendarState] = useState(() =>
    getInitialCalendarState()
  );
  const [tempRange, setTempRange] = useState({ start: null, end: null });
  const [hoveredDate, setHoveredDate] = useState(null);
  const [activeDateField, setActiveDateField] = useState(null);
  const filterRef = useRef(null);

  const isCheckInDateField = config.checkInFieldType === "date";
  const isCheckOutDateField = config.checkOutFieldType === "date";
  const isRangeMode = isCheckInDateField && isCheckOutDateField;

  const filteredLocationSuggestions = useMemo(() => {
    if (!isLocationSuggestionsEnabled) {
      return [];
    }

    if (!locationInputValue.trim()) {
      return locationSuggestions;
    }

    const normalizedQuery = locationInputValue.toLowerCase();
    return locationSuggestions.filter((name) =>
      name.toLowerCase().includes(normalizedQuery)
    );
  }, [isLocationSuggestionsEnabled, locationInputValue, locationSuggestions]);

  useEffect(() => {
    setLocationInputValue(initialValues.destination);
    setCheckInValue(initialValues.checkIn);
    setCheckOutValue(initialValues.checkOut);
    setSelectedAdults(initialValues.guests);
    setShowAdultsDropdown(false);
    setShowDatePicker(false);
    setShowLocationDropdown(false);
  }, [initialValues]);

  const isFilterModified = useMemo(() => {
    return (
      locationInputValue !== initialValues.destination ||
      checkInValue !== initialValues.checkIn ||
      checkOutValue !== initialValues.checkOut ||
      selectedAdults !== initialValues.guests
    );
  }, [
    locationInputValue,
    checkInValue,
    checkOutValue,
    selectedAdults,
    initialValues,
  ]);

  useEffect(() => {
    if (!showDatePicker) {
      setTempRange({
        start: parseInputDate(checkInValue),
        end: parseInputDate(checkOutValue),
      });
      setHoveredDate(null);
    }
  }, [showDatePicker, checkInValue, checkOutValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(event.target)) {
        setShowAdultsDropdown(false);
        setShowDatePicker(false);
        setShowLocationDropdown(false);
        setActiveDateField(null);
        setHoveredDate(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDatePicker = (field) => {
    if (!isCheckInDateField) return;

    const startDate = parseInputDate(checkInValue);
    const endDate = parseInputDate(checkOutValue);
    const baseDate =
      field === "checkout" && endDate
        ? endDate
        : startDate || endDate || new Date();

    const normalizedBase = normalizeToStartOfDay(baseDate) ?? new Date();

    setCalendarState({
      month: normalizedBase.getMonth(),
      year: normalizedBase.getFullYear(),
    });
    setTempRange({ start: startDate, end: endDate });
    setActiveDateField(field);
    setShowLocationDropdown(false);
    setShowAdultsDropdown(false);
    setShowDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
    setHoveredDate(null);
    setActiveDateField(null);
  };

  const handleDestinationInputChange = (event) => {
    const { value } = event.target;
    setLocationInputValue(value);
    if (isLocationSuggestionsEnabled) {
      setShowLocationDropdown(true);
      setShowAdultsDropdown(false);
      setShowDatePicker(false);
    }
  };

  const handleDestinationFocus = () => {
    if (isLocationSuggestionsEnabled) {
      setShowLocationDropdown(true);
      setShowAdultsDropdown(false);
      setShowDatePicker(false);
    }
  };

  const handleLocationSelect = (locationName) => {
    setLocationInputValue(locationName);
    setShowLocationDropdown(false);
  };

  const handleDateSelection = (date) => {
    if (!date) return;

    const normalizedDate = normalizeToStartOfDay(date);
    if (!normalizedDate) return;

    if (!isRangeMode) {
      setCheckInValue(formatDateForStorage(normalizedDate));
      closeDatePicker();
      return;
    }

    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      setTempRange({ start: normalizedDate, end: null });
      setHoveredDate(null);
      if (activeDateField === "checkout") {
        setActiveDateField("checkout");
      }
      return;
    }

    let rangeStart = tempRange.start;
    let rangeEnd = normalizedDate;

    if (isDateBefore(rangeEnd, rangeStart)) {
      [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
    }

    setTempRange({ start: rangeStart, end: rangeEnd });
    setCheckInValue(formatDateForStorage(rangeStart));
    setCheckOutValue(formatDateForStorage(rangeEnd));
    closeDatePicker();
  };

  const handleClearDates = () => {
    setTempRange({ start: null, end: null });
    setCheckInValue("");
    if (isRangeMode) {
      setCheckOutValue("");
    }
    setHoveredDate(null);
  };

  const handleMonthChange = (direction) => {
    setCalendarState((prev) => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;

      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }

      return { month: newMonth, year: newYear };
    });
  };

  const startOfCurrentMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const isPrevDisabled = () => {
    const prevMonthDate = new Date(
      calendarState.year,
      calendarState.month - 1,
      1
    );
    return prevMonthDate < startOfCurrentMonth();
  };

  const getDayClassNames = (options) => {
    const { isDisabled, isSelectedStart, isSelectedEnd, isInRange, isPreview } =
      options;

    let baseClasses =
      "h-12 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150";

    if (isDisabled) {
      baseClasses += " text-gray-300 cursor-not-allowed";
      return baseClasses;
    }

    if (isSelectedStart || isSelectedEnd) {
      baseClasses += " bg-green-600 text-white shadow-sm";
      if (isSelectedStart && !isSelectedEnd) {
        baseClasses += " rounded-r-none";
      }
      if (isSelectedEnd && !isSelectedStart) {
        baseClasses += " rounded-l-none";
      }
      return baseClasses;
    }

    if (isInRange) {
      return `${baseClasses} bg-green-200/80 text-green-900 ring-2 ring-green-400`;
    }

    if (isPreview) {
      return `${baseClasses} bg-green-100 text-green-700`;
    }

    return `${baseClasses} text-gray-700 hover:bg-green-100 hover:text-green-700`;
  };

  const DateRangePicker = () => {
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

    const weekDayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const renderMonth = (monthOffset) => {
      let monthIndex = calendarState.month + monthOffset;
      let yearIndex = calendarState.year;

      if (monthIndex > 11) {
        monthIndex -= 12;
        yearIndex += 1;
      } else if (monthIndex < 0) {
        monthIndex += 12;
        yearIndex -= 1;
      }

      const firstDayDate = new Date(yearIndex, monthIndex, 1);
      const firstDay = firstDayDate.getDay();
      const daysInMonth = new Date(yearIndex, monthIndex + 1, 0).getDate();

      const today = normalizeToStartOfDay(new Date());

      const cells = [];

      for (let index = 0; index < firstDay; index += 1) {
        cells.push(null);
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(new Date(yearIndex, monthIndex, day));
      }

      const selectedStart = tempRange.start;
      const selectedEnd = tempRange.end;

      let previewStart = null;
      let previewEnd = null;

      if (selectedStart && !selectedEnd && hoveredDate) {
        if (isDateBefore(hoveredDate, selectedStart)) {
          previewStart = hoveredDate;
          previewEnd = selectedStart;
        } else {
          previewStart = selectedStart;
          previewEnd = hoveredDate;
        }
      }

      return (
        <div className="flex-1" key={`${yearIndex}-${monthIndex}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800">
              {monthNames[monthIndex]} {yearIndex}
            </p>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDayNames.map((day) => (
              <div
                key={`${monthIndex}-${day}`}
                className="text-xs font-medium text-gray-500 text-center"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, cellIndex) => {
              if (!cell) {
                return <div key={`empty-${monthIndex}-${cellIndex}`} />;
              }

              const normalizedCell = normalizeToStartOfDay(cell);
              const isDisabled = isDateBefore(normalizedCell, today);
              const isSelectedStart =
                selectedStart && isSameDay(normalizedCell, selectedStart);
              const isSelectedEnd =
                selectedEnd && isSameDay(normalizedCell, selectedEnd);
              const isWithinRange =
                selectedStart &&
                selectedEnd &&
                isDateBefore(selectedStart, normalizedCell) &&
                isDateBefore(normalizedCell, selectedEnd);

              const isPreview =
                previewStart &&
                previewEnd &&
                !isWithinRange &&
                !isSelectedStart &&
                !isSelectedEnd &&
                isDateBefore(previewStart, normalizedCell) &&
                isDateBefore(normalizedCell, previewEnd);

              return (
                <button
                  type="button"
                  key={`day-${monthIndex}-${normalizedCell.getDate()}`}
                  onClick={() =>
                    !isDisabled && handleDateSelection(normalizedCell)
                  }
                  onMouseEnter={() =>
                    !isDisabled && setHoveredDate(normalizedCell)
                  }
                  onMouseLeave={() => setHoveredDate(null)}
                  className={getDayClassNames({
                    isDisabled,
                    isSelectedStart,
                    isSelectedEnd,
                    isInRange: isWithinRange,
                    isPreview,
                  })}
                  disabled={isDisabled}
                >
                  {normalizedCell.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="absolute top-full left-0 right-0 md:left-1/2 md:-translate-x-1/2 mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-6 w-full md:w-[620px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isPrevDisabled()) {
                  handleMonthChange(-1);
                }
              }}
              className={`p-2 rounded-full border transition-colors ${
                isPrevDisabled()
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
              }`}
              disabled={isPrevDisabled()}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="p-2 rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="text-sm font-semibold text-gray-700">
            {monthNames[calendarState.month]} {calendarState.year}
          </div>
          <button
            type="button"
            onClick={handleClearDates}
            className="text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Clear dates
          </button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {renderMonth(0)}
          {renderMonth(1)}
        </div>

        {isRangeMode && (!tempRange.start || !tempRange.end) && (
          <p className="mt-4 text-xs text-gray-500">
            Select a check-in date, then choose your check-out date.
          </p>
        )}
      </div>
    );
  };

  const LocationSuggestionsDropdown = () => {
    if (!isLocationSuggestionsEnabled || !showLocationDropdown) {
      return null;
    }

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
        {isLoadingLocations ? (
          <div className="px-4 py-3 text-sm text-gray-500">
            Loading locations…
          </div>
        ) : filteredLocationSuggestions.length > 0 ? (
          filteredLocationSuggestions.map((locationName, index) => (
            <button
              key={`location-${locationName}`}
              type="button"
              onClick={() => handleLocationSelect(locationName)}
              className={`w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
                locationInputValue === locationName
                  ? "bg-green-50 text-green-600 font-medium"
                  : "text-gray-700"
              } ${index === 0 ? "rounded-t-xl" : ""} ${
                index === filteredLocationSuggestions.length - 1
                  ? "rounded-b-xl"
                  : ""
              }`}
              style={{
                borderRadius:
                  index === 0
                    ? "0.75rem 0.75rem 0 0"
                    : index === filteredLocationSuggestions.length - 1
                    ? "0 0 0.75rem 0.75rem"
                    : "0",
              }}
            >
              <span className="font-medium">{locationName}</span>
              {locationInputValue === locationName && (
                <span className="float-right">
                  <svg
                    className="w-4 h-4 text-green-600"
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
          ))
        ) : (
          <div className="px-4 py-3 text-sm text-gray-500">
            No matching locations found.
          </div>
        )}
      </div>
    );
  };

  const CustomAdultsDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
      {config.dropdownOptions.map((option, index) => (
        <button
          key={option}
          type="button"
          onClick={() => {
            setSelectedAdults(option);
            setShowAdultsDropdown(false);
          }}
          className={`w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
            selectedAdults === option
              ? "bg-green-50 text-green-600 font-medium"
              : "text-gray-700"
          } ${index === 0 ? "rounded-t-lg" : ""} ${
            index === config.dropdownOptions.length - 1 ? "rounded-b-lg" : ""
          }`}
        >
          <span className="font-medium">{option}</span>
          {selectedAdults === option && (
            <span className="float-right">
              <svg
                className="w-4 h-4 text-green-600"
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

  const handleSearch = async () => {
    if (!locationInputValue) {
      setToast({
        message: "Please select a destination before searching.",
        type: "warning",
      });
      return;
    }

    // Create the new filter values
    const newFilters = {
      destination: locationInputValue,
      checkIn: checkInValue,
      checkOut: checkOutValue,
      guests: selectedAdults,
    };

    setIsSearching(true);

    // Simulate searching with a brief delay for loading state
    setTimeout(() => {
      // Apply the filters - this will update both filterValues and appliedFilters
      applyFilters(newFilters);
      setIsSearching(false);

      // Toast will be shown by the results page based on found items
    }, 600);
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleClearFilters = () => {
    // Clear local state
    setLocationInputValue(initialValues.destination);
    setCheckInValue(initialValues.checkIn);
    setCheckOutValue(initialValues.checkOut);
    setSelectedAdults(initialValues.guests);
    setTempRange({ start: null, end: null });

    // Clear context filters
    clearFilters();
  };

  return (
    <div
      ref={filterRef}
      className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative filter-field">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
            {config.destinationLabel}
          </label>
          <input
            type="text"
            placeholder={config.destinationPlaceholder}
            value={locationInputValue}
            onChange={handleDestinationInputChange}
            onFocus={handleDestinationFocus}
            autoComplete="off"
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-700"
          />
          <LocationSuggestionsDropdown />
        </div>

        <div className="relative filter-field">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
            {config.checkInLabel}
          </label>
          <input
            type="text"
            placeholder={config.checkInPlaceholder}
            value={
              isCheckInDateField
                ? formatDateForDisplay(checkInValue)
                : checkInValue
            }
            readOnly={isCheckInDateField}
            onClick={
              isCheckInDateField ? () => openDatePicker("checkin") : undefined
            }
            onChange={
              !isCheckInDateField
                ? (event) => setCheckInValue(event.target.value)
                : undefined
            }
            className={`w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-700 ${
              isCheckInDateField ? "cursor-pointer" : ""
            }`}
          />
          {isCheckInDateField && showDatePicker && <DateRangePicker />}
        </div>

        <div className="relative filter-field">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
            {config.checkOutLabel}
          </label>
          <input
            type="text"
            placeholder={config.checkOutPlaceholder}
            value={
              isCheckOutDateField
                ? formatDateForDisplay(checkOutValue)
                : checkOutValue
            }
            readOnly={isCheckOutDateField}
            onClick={
              isCheckOutDateField ? () => openDatePicker("checkout") : undefined
            }
            onChange={
              !isCheckOutDateField
                ? (event) => setCheckOutValue(event.target.value)
                : undefined
            }
            className={`w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-700 ${
              isCheckOutDateField ? "cursor-pointer" : ""
            }`}
          />
        </div>

        <div className="relative filter-field">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
            {config.dropdownLabel}
          </label>
          <button
            type="button"
            onClick={() => {
              setShowLocationDropdown(false);
              setShowDatePicker(false);
              setShowAdultsDropdown((open) => !open);
            }}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between text-sm text-gray-700"
          >
            <span>{selectedAdults}</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                showAdultsDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showAdultsDropdown && <CustomAdultsDropdown />}
        </div>

        <div className="filter-field flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-200 text-sm flex items-center justify-center gap-2"
          >
            {isSearching ? (
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
                <span>Searching...</span>
              </>
            ) : (
              config.searchButtonText
            )}
          </button>
        </div>
      </div>

      {isFilterModified && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-green-600 hover:text-green-700 font-semibold border border-green-300 hover:border-green-500 rounded-lg hover:bg-green-50 transition-colors"
          >
            <i className="fa fa-times mr-2"></i>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default Filter;
