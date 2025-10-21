import React from "react";
import kgl from "../assets/images/kgl.jpg";
import msnz from "../assets/images/msnz.jpg";
import gisenyi from "../assets/images/gisenyi.jpg";
import mesuim from "../assets/images/mesuim.jpg";
import chant from "../assets/images/chant.jpg";

// Custom CSS to hide scrollbar
const scrollbarStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

const Cities = () => {
  const City = [
    { id: 1, name: "Kigali", image: kgl, place: 100 },
    { id: 2, name: "Musanze", image: msnz, place: 45 },
    {
      id: 3,
      name: "Rubavu",
      image: gisenyi,
      place: 67,
    },
    { id: 5, name: "Huye", image: mesuim, place: 52 },
    { id: 4, name: "Karongi", image: chant, place: 38 },
    { id: 6, name: "Nyanza", image: mesuim, place: 29 },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyle }} />
      <h2 className="text-xl font-semibold mb-4">
        Untold Rwanda
      </h2>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 md:gap-6 pb-4">
          {City.map((city) => (
            <div
              key={city.id}
              className="flex-shrink-0 w-56 md:w-64 lg:w-72 shadow-sm hover:shadow-md transition-shadow bg-white rounded-lg overflow-hidden"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-40 md:h-48 lg:h-52 object-cover"
              />
              <div className="p-3 md:p-4">
                <h3 className="font-semibold text-gray-800">
                  {city.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {city.place} places
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Cities;
