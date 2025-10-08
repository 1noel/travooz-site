import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFilterContext } from "../context/useFilterContext";

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

const DISPLAY_DATE_OPTIONS = { weekday: "short", month: "short", day: "numeric" };

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

const Filter = () => {
  const { activeCategory } = useFilterContext();

  const config = useMemo(
    () => FILTER_CONFIGS[activeCategory] ?? FILTER_CONFIGS.default,
    [activeCategory]
  );

  const dropdownOptions = useMemo(
    () => config.dropdownOptions?.map((label) => ({ value: label, label })) ?? [],
    [config.dropdownOptions]
  );

  const [selectedAdults, setSelectedAdults] = useState(
    config.dropdownDefault ?? config.dropdownOptions?.[0] ?? ""
  );
  const [showAdultsDropdown, setShowAdultsDropdown] = useState(false);
  const [checkInValue, setCheckInValue] = useState("");
  const [checkOutValue, setCheckOutValue] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarState, setCalendarState] = useState(() => getInitialCalendarState());
  const [tempRange, setTempRange] = useState({ start: null, end: null });
  const [hoveredDate, setHoveredDate] = useState(null);
  const [activeDateField, setActiveDateField] = useState(null);
  const filterRef = useRef(null);

  const isCheckInDateField = config.checkInFieldType === "date";
  const isCheckOutDateField = config.checkOutFieldType === "date";
  const isRangeMode = isCheckInDateField && isCheckOutDateField;

  useEffect(() => {
    const fallback = config.dropdownOptions?.[0] ?? "";
    setSelectedAdults(config.dropdownDefault ?? fallback);
  }, [config.dropdownDefault, config.dropdownOptions]);

  useEffect(() => {
    setShowAdultsDropdown(false);
    setShowDatePicker(false);
    setCheckInValue("");
    setCheckOutValue("");
    setTempRange({ start: null, end: null });
    setHoveredDate(null);
    setActiveDateField(null);
    setCalendarState(getInitialCalendarState());
  }, [config.key]);

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
    setShowAdultsDropdown(false);
    setShowDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
    setHoveredDate(null);
    setActiveDateField(null);
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
    const prevMonthDate = new Date(calendarState.year, calendarState.month - 1, 1);
    return prevMonthDate < startOfCurrentMonth();
  };

  const getDayClassNames = (options) => {
    const {
      isDisabled,
      isSelectedStart,
      isSelectedEnd,
      isInRange,
      isPreview,
    } = options;

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
              const isSelectedEnd = selectedEnd && isSameDay(normalizedCell, selectedEnd);
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
                  onClick={() => !isDisabled && handleDateSelection(normalizedCell)}
                  onMouseEnter={() => !isDisabled && setHoveredDate(normalizedCell)}
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

  const CustomAdultsDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
      {dropdownOptions.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            setSelectedAdults(option.value);
            setShowAdultsDropdown(false);
          }}
          className={`w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
            selectedAdults === option.value
              ? "bg-green-50 text-green-600 font-medium"
              : "text-gray-700"
          } ${index === 0 ? "rounded-t-lg" : ""} ${
            index === dropdownOptions.length - 1 ? "rounded-b-lg" : ""
          }`}
        >
          <span className="font-medium">{option.label}</span>
          {selectedAdults === option.value && (
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

  return (
    <div ref={filterRef} className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative filter-field">
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
            {config.destinationLabel}
          </label>
          <input
            type="text"
            placeholder={config.destinationPlaceholder}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-700"
          />
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
            onClick={() => setShowAdultsDropdown((open) => !open)}
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
          {showAdultsDropdown && dropdownOptions.length > 0 && (
            <CustomAdultsDropdown />
          )}
        </div>

        <div className="filter-field flex items-end">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 text-sm">
            {config.searchButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
