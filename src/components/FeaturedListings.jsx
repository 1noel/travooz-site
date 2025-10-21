// src/components/FeaturedListings.jsx
import React from "react";

const listings = [
  {
    id: 1,
    imageUrl:
      "https://www.jeniktours.com/wp-content/uploads/2022/02/one-only-nyungwe-house.jpg",
    title: "One&Only Nyungwe House",
    category: "Luxury Lodge",
  },
  {
    id: 2,
    imageUrl:
      "https://www.volcanoesparkrwanda.org/wp-content/uploads/2017/09/Virunga-Lodge.jpg",
    title: "Virunga Lodge",
    category: "Eco Lodge",
  },
  {
    id: 3,
    imageUrl:
      "https://www.astepahead.es/wp-content/uploads/2000/06/Sabyinyo-15-869x580.jpg",
    title: "Sabyinyo Silverback Lodge",
    category: "Mountain Lodge",
  },
];

const FeaturedListings = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Featured Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
          >
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">{listing.title}</h3>
              <p className="text-xs text-gray-600">{listing.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedListings;
