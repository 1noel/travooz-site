// src/components/TrendingSpots.jsx
import React from "react";

const spots = [
  {
    id: 1,
    imageUrl:
      "https://www.safaribookings.com/blog/wp-content/uploads/2018/02/Akagera-National-Park-1.jpg",
    title: "Akagera National Park",
    description: "Experience a true African safari.",
  },
  {
    id: 2,
    imageUrl:
      "https://www.travelandleisure.com/thmb/JdyZeJChh_52hSH3aI31a_3X- M=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/kigali-rwanda-KIGALI0122-8356f5e94b6343a497a0f62243d67189.jpg",
    title: "Kigali",
    description: "Explore the vibrant capital city.",
  },
  {
    id: 3,
    imageUrl:
      "https://media.cntraveler.com/photos/5a70a31652e7b1541f531278/16:9/w_2560%2Cc_limit/Lake-Kivu__2018_GettyImages-528732298.jpg",
    title: "Lake Kivu",
    description: "Relax by the stunning shores.",
  },
];

const TrendingSpots = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Trending Spots</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
          >
            <img
              src={spot.imageUrl}
              alt={spot.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold">{spot.title}</h3>
              <p className="text-gray-600">{spot.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSpots;
