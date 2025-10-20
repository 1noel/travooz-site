// src/components/TopRated.jsx
import React from "react";

const items = [
  {
    id: 1,
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/a7/ee/dc/caption.jpg?w=700&h=-1&s=1",
    title: "Kigali Marriott Hotel",
    rating: 4.5,
    reviews: 1500,
  },
  {
    id: 2,
    imageUrl:
      "https://yellowzebrasafaris.com/media/38724/pool-loungers-the-retreat-kigali-rwanda.jpg?anchor=center&mode=crop&width=2048&height=1024&format=jpg&rnd=131871981880000000",
    title: "The Retreat",
    rating: 4.8,
    reviews: 800,
  },
  {
    id: 3,
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/f5/ae/a3/heaven-restaurant-boutique.jpg?w=1200&h=-1&s=1",
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
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.round(item.rating)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
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
