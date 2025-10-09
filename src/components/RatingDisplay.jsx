import React from "react";

const RatingDisplay = ({ averageRating, totalReviews, onRateClick }) => {
  const displayRating = averageRating || 0;
  const fullStars = Math.floor(displayRating);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Average Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800">
              {displayRating > 0 ? displayRating.toFixed(1) : "N/A"}
            </div>
            <div className="flex items-center justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < fullStars
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {totalReviews > 0 ? (
                <>
                  Based on <span className="font-semibold">{totalReviews}</span>{" "}
                  {totalReviews === 1 ? "review" : "reviews"}
                </>
              ) : (
                "No reviews yet"
              )}
            </p>
          </div>

          {/* Rating Breakdown */}
          {displayRating > 0 && (
            <div className="hidden lg:block flex-1 min-w-[200px]">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-600 w-8">{star} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${totalReviews > 0 ? Math.random() * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Rate Button */}
        <div className="flex flex-col items-center justify-center gap-3">
          <button
            onClick={onRateClick}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            Rate This Property
          </button>
          <p className="text-xs text-gray-500 text-center">
            Share your experience with others
          </p>
        </div>
      </div>
    </div>
  );
};

export default RatingDisplay;
