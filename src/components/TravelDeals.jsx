import React from "react";

const deals = [
  {
    id: 1,
    imageUrl: "/images/msnz.jpg",
    title: "Weekend in Musanze",
    description: "Explore the stunning volcanoes and serene lakes.",
    price: "$250",
  },
  {
    id: 2,
    imageUrl: "/images/gisenyi.jpg",
    title: "Beach Getaway in Rubavu",
    description: "Relax on the shores of Lake Kivu.",
    price: "$180",
  },
  {
    id: 3,
    imageUrl: "/images/mesuim.jpg",
    title: "Cultural Tour in Huye",
    description: "Discover the history and culture of Rwanda.",
    price: "$150",
  },
];

const TravelDeals = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Special Travel Deals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
          >
            <img
              src={deal.imageUrl}
              alt={deal.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold">{deal.title}</h3>
              <p className="text-gray-600">{deal.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-green-500">
                  {deal.price}
                </span>
                <a
                  href="#"
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  View Deal
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelDeals;
