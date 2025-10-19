import phone from "../assets/images/phone_image.jpg";
const DownloadApp = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
              Your Travel Companion, On the Go
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-10 text-pretty">
              Book hotels, cars, and activities with exclusive deals, all in the
              Travooz app. Your next adventure is just a tap away.
            </p>

            <ul className="space-y-5 mb-12 text-left max-w-md mx-auto lg:mx-0">
              <li className="flex items-start gap-4">
                <div className="bg-green-500 rounded-full p-2.5 flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 text-lg leading-relaxed">
                  Real-time booking updates
                </span>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-green-500 rounded-full p-2.5 flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 text-lg leading-relaxed">
                  Exclusive app-only deals and discounts
                </span>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-green-500 rounded-full p-2.5 flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 text-lg leading-relaxed">
                  Easy and secure booking process
                </span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 bg-green-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
                aria-label="Download on the App Store"
              >
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-90">Download on the</div>
                  <div className="text-lg font-bold leading-tight">
                    App Store
                  </div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                aria-label="Get it on Google Play"
              >
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-90">GET IT ON</div>
                  <div className="text-lg font-bold leading-tight">
                    Google Play
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Phone and QR Code */}
          <div className="flex flex-col items-center gap-8 lg:gap-10">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
              <img
                src={phone}
                alt="Travooz App Interface"
                className="relative w-full max-w-md h-auto drop-shadow-2xl rounded-3xl"
              />
            </div>

            <div className="flex items-center gap-6 bg-white p-8 rounded-2xl shadow-xl border-2 border-green-500/20">
              <div className="bg-white p-3 rounded-xl border-1 border-green-500">
                <img
                  src="https://i.pinimg.com/736x/8e/69/33/8e69334a7f90319b49a2d42b61ddf15d.jpg"
                  alt="QR Code for app download"
                  className="w-48 h-48"
                />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-2 text-lg">
                  Scan to Download
                </p>
                <p className="text-sm text-gray-600">
                  Available on iOS & Android
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
