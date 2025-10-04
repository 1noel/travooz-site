import React from "react";
import { useNavigate } from "react-router-dom";
import { getAllEatingPlaces } from "../../api/eating";

const Eating = () => {
    const navigate = useNavigate()
    const eatingPlaces = getAllEatingPlaces()

    const handleRestaurantClick = (place) => {
        navigate(`/restaurant/${place.id}`)
    }

    return (
        <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-5 mt-10">
            <h1 className="text-2xl font-bold mb-4">Eating Out</h1>
            <p className="text-gray-700 mb-6">
                Explore the best dining options around you. Whether you're craving local cuisine or international flavors, we've got you covered with top-rated restaurants and eateries.
            </p>

            <div className="flex ">
                <span className="border-b border-green-600 mr-6 cursor-pointer">All</span>
                <span className="mr-6 cursor-pointer">Local Food</span>
                <span className="mr-6 cursor-pointer">Street Food</span>
                <span className="mr-6 cursor-pointer">Fast Food</span>
                <span className="mr-6 cursor-pointer">Fine Dining</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-5">
                {eatingPlaces.map(place => (
                    <div key={place.id} onClick={() => handleRestaurantClick(place)} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer rounded">
                        <img src={place.image} alt={place.name} className="w-full h-35 object-cover" />
                        <div className="px-4 py-2">
                            <h2 className="font-semibold text-gray-800">{place.name}</h2>
                            <p className="text-xs text-gray-600"> <i className="fa fa-location-dot"></i>{place.location}</p>
                            <p className="text-xs text-gray-500 mt-1">{place.cuisine} • {place.category}</p>
                            <div className="flex items-center gap-2 mt-2">
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Eating;