// src/components/NearbyGems.jsx
import React from "react";

const gems = [
  {
    id: 1,
    imageUrl:
      "https://i0.wp.com/artsandculture.google.com/asset/the-canopy-walkway-in-nyungwe-forest-national-park-rebero/igF3XoMAgYp6tA",
    title: "Nyungwe Canopy Walk",
    description: "A thrilling walk above the rainforest.",
  },
  {
    id: 2,
    imageUrl:
      "https://www.andbeyond.com/wp-content/uploads/sites/5/Akagera-Game-Drive-Feature.jpg",
    title: "Akagera National Park",
    description: "Spot the Big Five in this beautiful park.",
  },
  {
    id: 3,
    imageUrl: "https://live.staticflickr.com/3777/12331165485_9169a8b851_b.jpg",
    title: "King's Palace Museum",
    description: "Discover Rwanda's royal history.",
  },
];

const NearbyGems = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Nearby Gems</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gems.map((gem) => (
          <div
            key={gem.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
          >
            <img
              src={gem.imageUrl}
              alt={gem.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold">{gem.title}</h3>
              <p className="text-gray-600">{gem.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyGems;
