import React from "react";
import { useNavigate } from "react-router-dom";
import Categories from "../components/Categories";
import Cities from "../components/Cities";
import Hotels from "./hotels/Hotels";
import AdBanner from "../components/AdBanner";
import TravelDeals from "../components/TravelDeals";

const Home = () => {
  const navigate = useNavigate();

  const handleHomestaysClick = () => {
    navigate("/hotels");
  };

  return (
    <main className="min-h-screen">
      <Categories />
      <section className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 space-y-5">
        {/* location */}
        <div className="">
          <Cities />
        </div>
      </section>

      <div>
        <Hotels />
      </div>

      {/* Holiday Rentals Promo Section */}
      <section className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-8">
        <div className="relative bg-gradient-to-r from-green-500 to-green-600 rounded-2xl overflow-hidden">
          <div className="px-6 md:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Text Content */}
              <div className="text-white">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                  Want to feel at home on your next adventure?
                </h2>
                <button
                  onClick={handleHomestaysClick}
                  className="bg-white text-green-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Discover homestays
                </button>
              </div>

              {/* Illustration */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-60 h-44 md:w-72 md:h-52">
                  {/* Background shapes */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-20 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-12 h-12 bg-yellow-400 bg-opacity-30 rounded-full"></div>

                  {/* Main illustration container */}
                  <div className="relative bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm">
                    {/* Chair illustration */}
                    <div className="relative">
                      {/* Chair back */}
                      <div className="w-16 h-20 bg-yellow-400 rounded-t-2xl mx-auto relative">
                        {/* Chair cushion pattern */}
                        <div className="absolute inset-1.5 bg-yellow-300 rounded-t-xl">
                          <div className="w-full h-0.5 bg-yellow-500 rounded-full mt-1.5"></div>
                          <div className="w-3/4 h-0.5 bg-yellow-500 rounded-full mt-1.5 mx-auto"></div>
                        </div>
                      </div>

                      {/* Chair seat */}
                      <div className="w-20 h-5 bg-yellow-400 rounded-lg mx-auto -mt-1.5 relative">
                        <div className="absolute inset-0.5 bg-yellow-300 rounded-md"></div>
                      </div>

                      {/* Chair legs */}
                      <div className="flex justify-between w-20 mx-auto mt-0.5">
                        <div className="w-0.5 h-6 bg-gray-700 rounded-full"></div>
                        <div className="w-0.5 h-6 bg-gray-700 rounded-full"></div>
                        <div className="w-0.5 h-6 bg-gray-700 rounded-full"></div>
                        <div className="w-0.5 h-6 bg-gray-700 rounded-full"></div>
                      </div>
                    </div>

                    {/* Side table */}
                    <div className="absolute right-1 bottom-6">
                      <div className="w-10 h-0.5 bg-gray-700 rounded-full"></div>
                      <div className="w-0.5 h-5 bg-gray-700 rounded-full mx-auto"></div>
                      <div className="w-6 h-0.5 bg-gray-700 rounded-full mx-auto"></div>
                      {/* Coffee cup on table */}
                      <div className="absolute -top-2 right-0.5 w-2.5 h-2.5 bg-orange-400 rounded-full">
                        <div className="w-0.5 h-1.5 bg-orange-500 rounded-full absolute right-0 top-0.5"></div>
                      </div>
                    </div>

                    {/* Plant decoration */}
                    <div className="absolute left-1 top-3">
                      <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                      <div className="absolute top-0 left-0.5 w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="absolute top-0.5 -left-0.5 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      <div className="absolute top-1 left-1.5 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white bg-opacity-30 rounded-lg rotate-12"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-400 bg-opacity-40 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white bg-opacity-5 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner Section */}
      <section className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-8">
        <AdBanner
          imageUrl="https://i.pinimg.com/1200x/b5/24/85/b52485be31f7b08774a0578d5dbcefc5.jpg"
          title="Plan Your Next Getaway"
          description="Discover amazing places at unbeatable prices."
          buttonText="Explore Now"
          buttonLink="/deals"
        />
      </section>

      {/* Travel Deals Section */}
      <section className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 py-8">
        <TravelDeals />
      </section>
    </main>
  );
};

export default Home;
