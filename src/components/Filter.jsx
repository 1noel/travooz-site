import React, { useState, useEffect } from "react";

const Filter = () => {
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showAdultsDropdown, setShowAdultsDropdown] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [selectedAdults, setSelectedAdults] = useState("2 Adults");

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
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

  // Custom Calendar Component
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

    const getDaysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
      return new Date(year, month, 1).getDay();
    };

    const handleDateSelect = (day) => {
      const date = new Date(displayYear, displayMonth, day);
      const formattedDate = date.toLocaleDateString("en-CA");
      onDateSelect(formattedDate);
      onClose();
    };

    const handlePrevMonth = () => {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear(displayYear - 1);
      } else {
        setDisplayMonth(displayMonth - 1);
      }
    };

    const handleNextMonth = () => {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear(displayYear + 1);
      } else {
        setDisplayMonth(displayMonth + 1);
      }
    };

    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        displayMonth === currentMonth &&
        displayYear === currentYear;
      const isPast =
        new Date(displayYear, displayMonth, day) <
        new Date(currentYear, currentMonth, today.getDate());

      days.push(
        <button
          key={day}
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
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
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

        {/* Days of Week */}
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

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 mb-3">{days}</div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
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

  // Custom Adults Dropdown
  const CustomAdultsDropdown = () => {
    const adultOptions = [
      { value: "1 Adult", label: "1 Adult" },
      { value: "2 Adults", label: "2 Adults" },
      { value: "3 Adults", label: "3 Adults" },
      { value: "4 Adults", label: "4 Adults" },
      { value: "5+ Adults", label: "5+ Adults" },
    ];

    const handleAdultSelect = (option) => {
      setSelectedAdults(option.value);
      setShowAdultsDropdown(false);
    };

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
        {adultOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleAdultSelect(option)}
            className={`w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-600 transition-all duration-200 ${
              selectedAdults === option.value
                ? "bg-green-50 text-green-600 font-medium"
                : "text-gray-700"
            } ${index === 0 ? "rounded-t-lg" : ""} ${
              index === adultOptions.length - 1 ? "rounded-b-lg" : ""
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
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-1.5 mb-8 py-4 px-4.5">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Destination */}
        <div className="relative">
          <input
            type="text"
            placeholder="Destination"
            className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Check-in */}
        <div className="relative">
          <input
            type="text"
            placeholder="Select date"
            value={
              checkInDate
                ? new Date(checkInDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : ""
            }
            readOnly
            onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
            className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
          />
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
            Check-in
          </label>
          {showCheckInCalendar && (
            <CustomCalendar
              onDateSelect={setCheckInDate}
              onClose={() => setShowCheckInCalendar(false)}
            />
          )}
        </div>

        {/* Check-out */}
        <div className="relative">
          <input
            type="text"
            placeholder="Select date"
            value={
              checkOutDate
                ? new Date(checkOutDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : ""
            }
            readOnly
            onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
            className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
          />
          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
            Check-out
          </label>
          {showCheckOutCalendar && (
            <CustomCalendar
              onDateSelect={setCheckOutDate}
              onClose={() => setShowCheckOutCalendar(false)}
            />
          )}
        </div>

        {/* Adults */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAdultsDropdown(!showAdultsDropdown)}
            className="w-full p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between"
          >
            <span>{selectedAdults}</span>
            <svg
              className="w-4 h-4 text-gray-400"
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

        {/* Search Button */}
        <div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white p-1 rounded-lg font-semibold transition-colors duration-200">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
