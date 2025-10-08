import React, { useEffect, useMemo, useState } from "react";
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

const formatDateForDisplay = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const Filter = () => {
  const { activeCategory } = useFilterContext();
  const config = useMemo(
    () => FILTER_CONFIGS[activeCategory] ?? FILTER_CONFIGS.default,
    [activeCategory]
  );

  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showAdultsDropdown, setShowAdultsDropdown] = useState(false);
  const [checkInValue, setCheckInValue] = useState("");
  const [checkOutValue, setCheckOutValue] = useState("");
  const [selectedAdults, setSelectedAdults] = useState(
    config.dropdownDefault
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".filter-field")) {
        setShowCheckInCalendar(false);
        setShowCheckOutCalendar(false);
        setShowAdultsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCheckInValue("");
    setCheckOutValue("");
    setSelectedAdults(config.dropdownDefault);
    setShowCheckInCalendar(false);
    setShowCheckOutCalendar(false);
    setShowAdultsDropdown(false);
  }, [activeCategory, config.dropdownDefault]);

  const isCheckInDateField = config.checkInFieldType === "date";
  const isCheckOutDateField = config.checkOutFieldType === "date";

  const CustomCalendar = ({ onDateSelect, onClose }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const [displayMonth, setDisplayMonth] = useState(currentMonth);
    const [displayYear, setDisplayYear] = useState(currentYear);

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

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const handleDateSelect = (day) => {
      const date = new Date(displayYear, displayMonth, day);
      const formattedDate = date.toLocaleDateString("en-CA");
      onDateSelect(formattedDate);
      onClose();
    };

    const handlePrevMonth = () => {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear((year) => year - 1);
      } else {
        setDisplayMonth((month) => month - 1);
      }
    };

    const handleNextMonth = () => {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear((year) => year + 1);
      } else {
        setDisplayMonth((month) => month + 1);
      }
    };

    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const dayCells = [];

    for (let i = 0; i < firstDay; i += 1) {
      dayCells.push(<div key={`empty-${i}`} className="h-12 w-12" />);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const isToday =
        day === today.getDate() &&
        displayMonth === currentMonth &&
        displayYear === currentYear;
      const isPast =
        new Date(displayYear, displayMonth, day) <
        new Date(currentYear, currentMonth, today.getDate());

      dayCells.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && handleDateSelect(day)}
          disabled={isPast}
          className={`h-12 w-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 mx-auto ${
            isToday
              ? "bg-green-600 text-white shadow-lg"
              : isPast
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-green-100 hover:text-green-600"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 min-w-80">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-600"
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
          <h3 className="text-base font-semibold text-gray-800">
            {monthNames[displayMonth]} {displayYear}
          </h3>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-600"
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

        <div className="grid grid-cols-7 gap-2 mb-3">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">{dayCells}</div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onDateSelect("");
              onClose();
            }}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    );
  };

  const dropdownOptions =
    config.dropdownOptions?.map((label) => ({ value: label, label })) ?? [];

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
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
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
              isCheckInDateField ? formatDateForDisplay(checkInValue) : checkInValue
            }
            readOnly={isCheckInDateField}
            onClick={
              isCheckInDateField
                ? () => setShowCheckInCalendar((open) => !open)
                : undefined
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
          {isCheckInDateField && showCheckInCalendar && (
            <CustomCalendar
              onDateSelect={(value) => {
                setCheckInValue(value);
                setShowCheckInCalendar(false);
              }}
              onClose={() => setShowCheckInCalendar(false)}
            />
          )}
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
              isCheckOutDateField
                ? () => setShowCheckOutCalendar((open) => !open)
                : undefined
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
          {isCheckOutDateField && showCheckOutCalendar && (
            <CustomCalendar
              onDateSelect={(value) => {
                setCheckOutValue(value);
                setShowCheckOutCalendar(false);
              }}
              onClose={() => setShowCheckOutCalendar(false)}
            />
          )}
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
