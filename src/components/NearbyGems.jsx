// src/components/NearbyGems.jsx
import React from "react";

const gems = [
  {
    id: 1,
    imageUrl:
      "https://www.visitingrwanda.com/wp-content/uploads/2023/05/nyungwe-canopy.jpg",
    title: "Nyungwe Canopy Walk",
    description: "A thrilling walk above the rainforest.",
  },
  {
    id: 2,
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/34/fa/c2/caption.jpg?w=700&h=-1&s=1",
    title: "Akagera National Park",
    description: "Spot the Big Five in this beautiful park.",
  },
  {
    id: 3,
    imageUrl:
      "https://archaeology-travel.com/cdn-cgi/image/quality=90,format=auto,onerror=redirect,metadata=none/wp-content/uploads/2023/10/nyanza-kings-palace.jpg",
    title: "King's Palace Museum",
    description: "Discover Rwanda's royal history.",
  },
];

const NearbyGems = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Nearby Gems</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gems.map((gem) => (
          <div
            key={gem.id}
            className="relative rounded-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300"
          >
            <img
              src={gem.imageUrl}
              alt={gem.title}
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="text-xl font-bold">{gem.title}</h3>
              <p className="text-sm">{gem.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyGems;
