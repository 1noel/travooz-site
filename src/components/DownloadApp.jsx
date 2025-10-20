import phone from "../assets/images/phone_image.png";
import appStore from "../assets/images/appstore.png";
import playStore from "../assets/images/playstore.png";

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

            {/* --- Buttons Section --- */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {/* App Store Button */}
              <a href="#app-store">
                <img
                  src={appStore}
                  alt="Download on the App Store"
                  className="h-12 w-auto rounded-md"
                />
              </a>

              {/* Google Play Button */}
              <a href="#google-play">
                <img
                  src={playStore}
                  alt="Get it on Google Play"
                  className="h-12 w-auto rounded-md"
                />
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
