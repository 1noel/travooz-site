import React, { useState } from "react";

const Filter = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8));

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const generateCalendar = (date) => {
    const days = [],
      firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    for (let i = 0; i < (firstDay.getDay() + 6) % 7; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const handleDateClick = (month, day) => {
    const date = new Date(currentMonth.getFullYear(), month, day);
    if (date < new Date().setHours(0, 0, 0, 0)) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else if (date > checkIn) setCheckOut(date);
    else {
      setCheckIn(date);
      setCheckOut(null);
    }
  };

  const getDateStatus = (month, day) => {
    const date = new Date(currentMonth.getFullYear(), month, day);
    const isPast = date < new Date().setHours(0, 0, 0, 0);
    const isSelected =
      (checkIn && date.getTime() === checkIn.getTime()) ||
      (checkOut && date.getTime() === checkOut.getTime());
    const inRange =
      checkIn && checkOut && date >= checkIn && date <= checkOut && !isPast;
    return { isPast, isSelected, inRange };
  };
  const Divider = () => (
    <div className="hidden md:block h-12 w-px bg-gray-200"></div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 relative mt-5">
      <div className="bg-white rounded-lg shadow px-3 py-3 md:py-1 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-2">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Destination"
            className="w-full p-2 md:p-1 text-sm md:text-lg placeholder-gray-400 focus:outline-none border-b md:border-none border-gray-200"
          />
        </div>
        <Divider />
        {["Check-in", "Check-out"].map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex-1 min-w-0">
              <div
                className="w-full p-2 md:p-1 text-sm md:text-lg cursor-pointer hover:bg-gray-50 rounded flex items-center gap-2"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-gray-300 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <div className="text-gray-600 text-xs">{label}</div>
                  <div className="truncate text-sm md:text-base">
                    {(i === 0 ? checkIn : checkOut)
                      ? (i === 0 ? checkIn : checkOut).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" }
                        )
                      : "Select date"}
                  </div>
                </div>
              </div>
            </div>
            <Divider />
          </React.Fragment>
        ))}
        <div className="flex-1 min-w-0">
          <select className="w-full p-2 md:p-1 text-sm md:text-lg focus:outline-none appearance-none bg-white">
            {["2 Adults", "1 Adult", "3 Adults", "4+ Adults"].map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 md:px-5 py-2 md:py-1 text-sm md:text-md transition-colors whitespace-nowrap">
          Search
        </button>
      </div>

      {showCalendar && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] md:w-[600px] bg-white border rounded-lg shadow-2xl z-50 p-3 md:p-4">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1
                  )
                )
              }
              className="p-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <div className="flex justify-center gap-2 md:gap-4 flex-1">
              {[0, 1].map((i) => {
                const m = (currentMonth.getMonth() + i) % 12;
                const y =
                  currentMonth.getMonth() === 11 && i === 1
                    ? currentMonth.getFullYear() + 1
                    : currentMonth.getFullYear();
                return (
                  <h3 key={i} className="text-xs md:text-sm font-semibold">
                    {months[m]} {y}
                  </h3>
                );
              })}
            </div>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1
                  )
                )
              }
              className="p-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[
              currentMonth,
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
            ].map((month, monthIndex) => (
              <div key={monthIndex}>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 p-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendar(month).map((day, index) => {
                    if (!day) return <div key={index}></div>;
                    const { isPast, isSelected, inRange } = getDateStatus(
                      month.getMonth(),
                      day
                    );
                    return (
                      <div
                        key={index}
                        className={`text-center p-1 md:p-2 rounded aspect-square flex items-center justify-center text-xs md:text-sm cursor-pointer
                                                    ${
                                                      !isPast
                                                        ? "hover:bg-green-100"
                                                        : "text-gray-300 cursor-not-allowed"
                                                    }
                                                    ${
                                                      isSelected
                                                        ? "bg-green-600 text-white"
                                                        : inRange
                                                        ? "bg-green-100"
                                                        : ""
                                                    }`}
                        onClick={() =>
                          !isPast && handleDateClick(month.getMonth(), day)
                        }
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-3 gap-2">
            {["Cancel", "Apply"].map((text, i) => (
              <button
                key={text}
                onClick={() => setShowCalendar(false)}
                disabled={i === 1 && (!checkIn || !checkOut)}
                className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded ${
                  i === 0
                    ? "text-gray-600 hover:bg-gray-100"
                    : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
