// Hotels data - in a real application, this would come from an API
export const hotels = [
  {
    id: 1,
    name: "Kigali Radisson Blue Hotel",
    location: "Kigali, Rwanda",
    price: 120,
    image: "/images/radsn.jpg",
    images: [
      "/images/radsn.jpg",
      "/images/rm1.jpg",
      "/images/rm2.jpg",
      "/images/rm3.jpg",
      "/images/rm4.jpg",
      "/images/rm5.jpg",
    ],
    stars: 5,
    views: 1250,
    description:
      "Luxury 5-star hotel in the heart of Kigali with world-class amenities and service. Experience unparalleled comfort and sophisticated elegance in our premium suites and rooms.",
    rooms: [
      {
        id: 1,
        name: "Deluxe Room",
        price: 120,
        image: "/images/rm1.jpg",
        features: [
          "King Bed",
          "City View",
          "Free WiFi",
          "Air Conditioning",
          "TV Screen",
        ],
        size: "32 sqm",
        maxGuests: 2,
        description:
          "Elegant room with modern amenities, perfect for both business and leisure travelers seeking comfort and style in Kigali.",
      },
      {
        id: 2,
        name: "Executive Suite",
        price: 180,
        image: "/images/rm2.jpg",
        features: ["King Bed", "Living Area", "Kitchenette", "Balcony"],
        size: "55 sqm",
        maxGuests: 3,
        description:
          "Spacious suite with separate living area, perfect for business travelers and families seeking extra comfort and amenities.",
      },
      {
        id: 3,
        name: "Presidential Suite",
        price: 300,
        image: "/images/rm3.jpg",
        features: [
          "King Bed",
          "Separate Living Room",
          "Dining Area",
          "Premium View",
        ],
        size: "85 sqm",
        maxGuests: 4,
        description:
          "Experience the pinnacle of luxury in our Presidential Suite, featuring expansive living spaces, premium amenities, and breathtaking views of Kigali.",
      },
      {
        id: 4,
        name: "Family Room",
        price: 200,
        image: "/images/rm4.jpg",
        features: [
          "2 Queen Beds",
          "City View",
          "Free WiFi",
          "Air Conditioning",
          "TV Screen",
        ],
        size: "45 sqm",
        maxGuests: 4,
        description:
          "Spacious room designed for families, featuring two queen beds and modern amenities to ensure a comfortable stay for all guests.",
      },
    ],
  },
  {
    id: 2,
    name: "Ubumwe Grand Hotel Kigali",
    location: "Kigali, Rwanda",
    price: 90,
    image: "/images/ubmw.jpg",
    images: [
      "/images/ubmw.jpg",
      "/images/rm1.jpg",
      "/images/rm2.jpg",
      "/images/kgl.jpg",
      "/images/mesuim.jpg",
      "/images/mriot.jpg",
    ],
    stars: 4,
    views: 890,
    description:
      "Modern 4-star hotel offering comfort and convenience in downtown Kigali. Perfect for business travelers and tourists seeking quality accommodation at competitive rates.",
    rooms: [
      {
        id: 1,
        name: "Standard Room",
        price: 90,
        image: "/images/rm4.jpg",
        features: ["Queen Bed", "City View", "Free WiFi", "Work Desk"],
        size: "28 sqm",
        maxGuests: 2,
        description:
          "Cozy and well-appointed room with essential amenities, ideal for both business and leisure travelers visiting Kigali.",
      },
      {
        id: 2,
        name: "Superior Room",
        price: 130,
        image: "/images/rm5.jpg",
        features: ["King Bed", "Garden View", "Mini Fridge", "Seating Area"],
        size: "35 sqm",
        maxGuests: 2,
        description:
          "Spacious room with modern amenities and a beautiful garden view, ideal for a relaxing stay in Kigali.",
      },
    ],
  },
  {
    id: 3,
    name: "Kivu Peace View Hotel",
    location: "Rubavu, Rwanda",
    price: 150,
    image: "/images/pcv.jpg",
    images: [
      "/images/pcv.jpg",
      "/images/kivu.jpg",
      "/images/kbeach.jpg",
      "/images/sm1.jpg",
      "/images/sm2.jpg",
      "/images/sm3.jpg",
    ],
    stars: 3,
    views: 1540,
    description:
      "Scenic lakeside hotel with stunning views of Lake Kivu and peaceful surroundings. Enjoy tranquil moments by the lake with exceptional hospitality and serene atmosphere.",
    rooms: [
      {
        id: 1,
        name: "Lake View Room",
        price: 150,
        image: "/images/sm1.jpg",
        features: ["Queen Bed", "Lake View", "Private Balcony", "Free WiFi"],
        size: "30 sqm",
        maxGuests: 2,
        description:
          "Experience the serene beauty of Lake Kivu at Kivu Serena Hotel. Our Lake View Suite offers luxurious amenities and breathtaking views, perfect for a relaxing getaway.",
      },
      {
        id: 2,
        name: "Family Suite",
        price: 220,
        image: "/images/sm2.jpg",
        features: ["2 Queen Beds", "Lake View", "Living Area", "Kitchenette"],
        size: "50 sqm",
        maxGuests: 4,
        description:
          "Spacious suite ideal for families, offering beautiful lake views and modern amenities for a comfortable stay.",
      },
    ],
  },
  {
    id: 4,
    name: "Kivu Serena Hotel",
    location: "Rubavu, Rwanda",
    price: 150,
    image: "/images/kvs.jpg",
    images: [
      "/images/kvs.jpg",
      "/images/kvb.webp",
      "/images/gisenyi.jpg",
      "/images/sm4.jpg",
      "/images/chant.jpg",
      "/images/msnz.jpg",
    ],
    stars: 3,
    views: 1540,
    description:
      "Paternoster Lodge is situated in the picturesque fishing village of Paternoster. The village is internationally known for its abundance of Cape crayfish and other delicious sea produce, and its unique West Coast character, tranquility, security and natural beauty has become a favourite and regular destination for many a tourist, both national and international. Paternoster Lodge is situated in the centre of the village and boasts magnificent 180-degree views of the Atlantic Ocean and a 10 km stretch of clean white beach, only three minutes’ walk away. The lodge offers seven elegant bedrooms, all with sea views, and also features an on-site restaurant and pub, well-stocked with a wide variety of South African wines. This special events venue is ideal for conferences, team building exercises and wedding receptions. The relatively short distance to all the well-known tourist attractions of the Cape and the uniqueness of Paternoster make Paternoster Lodge the ideal place to visit.",
    rooms: [
      {
        id: 1,
        name: "Garden View Room",
        price: 150,
        image: "/images/sm3.jpg",
        features: ["King Bed", "Garden View", "Free WiFi", "Mini Bar"],
        size: "32 sqm",
        maxGuests: 2,
        description:
          "Experience the serene beauty of Lake Kivu at Kivu Serena Hotel. Our Lake View Suite offers luxurious amenities and breathtaking views, perfect for a relaxing getaway.",
      },
      {
        id: 2,
        name: "Lake View Suite",
        price: 250,
        image: "/images/sm4.jpg",
        features: ["King Bed", "Lake View", "Living Area", "Premium Amenities"],
        size: "60 sqm",
        maxGuests: 3,
        description:
          "Experience the serene beauty of Lake Kivu at Kivu Serena Hotel. Our Lake View Suite offers luxurious amenities and breathtaking views, perfect for a relaxing getaway.",
      },
    ],
  },
];
