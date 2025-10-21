// src/components/TrendingSpots.jsx
import React from "react";

const spots = [
  {
    id: 1,
    imageUrl:
      "https://www.bwindinationalparkuganda.com/wp-content/uploads/2024/04/5-top-safari-activities-in-Akagera-national-park-.jpg",
    title: "Akagera National Park",
    description: "Experience a true African safari.",
  },
  {
    id: 2,
    imageUrl:
      "https://www.achieveglobalsafaris.com/wp-content/uploads/2019/09/Kigali-City-Business-Center.jpg",
    title: "Kigali",
    description: "Explore the vibrant capital city.",
  },
  {
    id: 3,
    imageUrl:
      "https://labaafrica.com/wp-content/uploads/2022/12/lake-kivu-islands-1024x683.jpg",
    title: "Lake Kivu",
    description: "Relax by the stunning shores.",
  },
];

const TrendingSpots = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Trending Spots</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="relative rounded-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300"
          >
            <img
              src={spot.imageUrl}
              alt={spot.title}
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="text-xl font-bold">{spot.title}</h3>
              <p className="text-sm">{spot.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSpots;
