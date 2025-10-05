import React from "react";

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
    { id: 1, name: "Kigali", image: "src/assets/images/kgl.jpg", place: 100 },
    { id: 2, name: "Musanze", image: "src/assets/images/msnz.jpg", place: 45 },
    {
      id: 3,
      name: "Rubavu",
      image: "src/assets/images/gisenyi.jpg",
      place: 67,
    },
    { id: 5, name: "Huye", image: "src/assets/images/mesuim.jpg", place: 52 },
    { id: 4, name: "Karongi", image: "src/assets/images/chant.jpg", place: 38 },
    { id: 6, name: "Nyanza", image: "src/assets/images/mesuim.jpg", place: 29 },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyle }} />
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-4">
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
                <h3 className="text-base md:text-lg font-semibold text-gray-800">
                  {city.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
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
