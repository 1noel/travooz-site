// Eating places data - in a real application, this would come from an API
export const eatingPlaces = [
    {
        id: 1, 
        name: "Ubuntu Restaurant", 
        location: "Kigali, Rwanda", 
        price: 25, 
        image: "/src/assets/images/menu.jpg",
        images: [
            "/src/assets/images/menu.jpg",
            "/src/assets/images/restu.jpg",
            "/images/radsn.jpg",
            "/images/rm1.jpg",
            "/images/rm2.jpg"
        ],
        stars: 5, 
        views: 1250, 
        description: "Premium restaurant offering authentic Rwandan cuisine with a modern twist. Experience traditional flavors in an elegant atmosphere with exceptional service.",
        cuisine: "Rwandan",
        category: "Fine Dining"
    },
    {
        id: 2, 
        name: "Heaven Restaurant", 
        location: "Kigali, Rwanda",
        price: 18,
        image: "/src/assets/images/restu.jpg",
        images: [
            "/src/assets/images/restu.jpg",
            "/src/assets/images/menu.jpg",
            "/images/ubmw.jpg",
            "/images/kgl.jpg",
            "/images/pcv.jpg"
        ],
        stars: 4,
        views: 980,
        description: "A top-rated restaurant offering a blend of local and international cuisines in a vibrant atmosphere. Known for its excellent service and diverse menu.",
        cuisine: "International",
        category: "Casual Dining"
    },
    {
        id: 3, 
        name: "Kigali Café", 
        location: "Kigali, Rwanda",
        price: 12,
        image: "/src/assets/images/menu.jpg",
        stars: 4,
        views: 650,
        description: "Cozy café perfect for breakfast and light meals. Featuring fresh coffee, pastries, and a relaxed atmosphere ideal for meetings or casual dining.",
        cuisine: "Continental",
        category: "Café"
    },
    {
        id: 4, 
        name: "Spice Garden", 
        location: "Kigali, Rwanda",
        price: 22,
        image: "/src/assets/images/restu.jpg",
        stars: 4,
        views: 890,
        description: "Authentic Indian restaurant offering aromatic spices and traditional dishes. Experience the rich flavors of India in the heart of Kigali.",
        cuisine: "Indian",
        category: "Fine Dining"
    },
    {
        id: 5, 
        name: "Fast Bite", 
        location: "Kigali, Rwanda",
        price: 8,
        image: "/src/assets/images/menu.jpg",
        stars: 3,
        views: 420,
        description: "Quick service restaurant offering fast food options and local favorites. Perfect for a quick meal on the go.",
        cuisine: "Fast Food",
        category: "Fast Food"
    },
    {
        id: 6, 
        name: "Lake View Grill", 
        location: "Rubavu, Rwanda",
        price: 28,
        image: "/src/assets/images/restu.jpg",
        stars: 5,
        views: 1100,
        description: "Elegant lakeside restaurant with stunning views of Lake Kivu. Specializing in grilled meats and fresh fish with international flair.",
        cuisine: "Grill & Seafood",
        category: "Fine Dining"
    }
]

// Function to get eating place by ID
export const getEatingPlaceById = (id) => {
    return eatingPlaces.find(place => place.id === parseInt(id))
}

// Function to get all eating places
export const getAllEatingPlaces = () => {
    return eatingPlaces
}