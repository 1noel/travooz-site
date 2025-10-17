import React from "react";

const suggestionCardsData = [
  {
    id: 1,
    title: "Find your next stay",
    description: "Discover deals on hotels, homes, and much more...",
    imageUrl:
      "https://www.visitrwanda.com/wp-content/uploads/fly-images/12987/The-Retreat-1650x1081.jpg",
    buttonText: "Explore Stays",
    buttonLink: "/hotels",
  },
  {
    id: 2,
    title: "Rent a car for your next trip",
    description:
      "Explore the open road with our reliable and affordable car rentals.",
    imageUrl:
      "https://royalcarspune.com/wp-content/uploads/2024/08/slide_2-1536x600.webp",
    buttonText: "Browse Vehicles",
    buttonLink: "/cars",
  },
];

const SuggestionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {suggestionCardsData.map((card) => (
        <div
          key={card.id}
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden group"
        >
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h3 className="text-2xl font-bold">{card.title}</h3>
            <p className="text-lg mb-4">{card.description}</p>
            <a
              href={card.buttonLink}
              className="mt-4 inline-block bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              {card.buttonText}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuggestionCards;
