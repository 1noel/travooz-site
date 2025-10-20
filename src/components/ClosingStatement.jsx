import React from "react";

const ClosingStatement = () => {
  return (
    <div className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Discover Rwanda with Confidence
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of travelers who trust Travooz for their Rwandan
            adventures. From boutique hotels to luxury resorts, find verified
            accommodations that match your style and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <i className="fas fa-tags text-2xl"></i>
            </div>
            <div className="text-gray-900 font-bold text-xl mb-2">
              Best Price Guarantee
            </div>
            <p className="text-gray-600">
              Competitive rates on all accommodations across Rwanda
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <i className="fas fa-check-circle text-2xl"></i>
            </div>
            <div className="text-gray-900 font-bold text-xl mb-2">
              Verified Properties
            </div>
            <p className="text-gray-600">
              Every listing is carefully reviewed and authenticated
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <i className="fas fa-headset text-2xl"></i>
            </div>
            <div className="text-gray-900 font-bold text-xl mb-2">
              24/7 Support
            </div>
            <p className="text-gray-600">
              Our team is here to assist you throughout your journey
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/hotels"
            className="inline-block bg-green-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
          >
            Explore Stays
          </a>
          <p className="mt-4 text-sm text-gray-500">
            Free cancellation on most bookings • Instant confirmation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClosingStatement;
