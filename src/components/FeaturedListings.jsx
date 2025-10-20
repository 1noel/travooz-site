// src/components/FeaturedListings.jsx
import React from "react";

const listings = [
  {
    id: 1,
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/61/89/3f/nyungwe-house.jpg?w=1200&h=-1&s=1",
    title: "One&Only Nyungwe House",
    category: "Luxury Lodge",
  },
  {
    id: 2,
    imageUrl:
      "https://www.volcanoessafaris.com/wp-content/uploads/2013/11/Virunga-Lodge-1-1.jpg",
    title: "Virunga Lodge",
    category: "Eco Lodge",
  },
  {
    id: 3,
    imageUrl:
      "https://www.sabyinyo.com/wp-content/uploads/2018/10/sabyinyo-silverback-lodge-from-air-1200x800.jpg",
    title: "Sabyinyo Silverback Lodge",
    category: "Mountain Lodge",
  },
];

const FeaturedListings = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Featured Listings</h2>
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
              <h3 className="text-xl font-bold">{listing.title}</h3>
              <p className="text-gray-600">{listing.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedListings;
