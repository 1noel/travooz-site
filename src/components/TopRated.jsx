// src/components/TopRated.jsx
import React from "react";

const items = [
  {
    id: 1,
    imageUrl:
      "https://media-cdn.tripadvisor.com/media/photo-s/1a/b8/b9/d8/kigali-marriott-hotel.jpg",
    title: "Kigali Marriott Hotel",
    rating: 4.5,
    reviews: 1500,
  },
  {
    id: 2,
    imageUrl:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/271811867.jpg?k=b6f3b00a3e218520d200445480c5982e043b318e8113f8add0c768997f77d7fb&o=&hp=1",
    title: "The Retreat",
    rating: 4.8,
    reviews: 800,
  },
  {
    id: 3,
    imageUrl:
      "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/48498303.jpg?k=33c3a4ae333a3f65b83962b109e952f1b637ae3b94a82868ae1c5b4f62025f82&o=",
    title: "Heaven Restaurant & Boutique Hotel",
    rating: 4.6,
    reviews: 1200,
  },
];

const TopRated = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Top Rated</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <div className="flex items-center mt-2">
                <span className="text-yellow-500">
                  {"★".repeat(Math.round(item.rating))}
                </span>
                <span className="text-gray-400">
                  {"★".repeat(5 - Math.round(item.rating))}
                </span>
                <span className="text-gray-600 ml-2">
                  {item.rating} ({item.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRated;
