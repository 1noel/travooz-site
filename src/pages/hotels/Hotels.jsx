import React from "react";
import { useNavigate } from "react-router-dom";
import { getAllHotels } from "../../api/hotelsData";

const Hotels = () => {
    const navigate = useNavigate()
    const hotels = getAllHotels()

    const handleHotelClick = (hotel) => {
        navigate(`/hotel/${hotel.id}`)
    }
    return (
        <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-5 mt-10">
            <h1 className="text-2xl font-bold mb-4">Home Stays</h1>
            {/* Hotel listings will go here */}

            <div className="flex ">
                <span className="border-b border-green-600 mr-6 cursor-pointer">All</span>
                <span className="mr-6 cursor-pointer">Hotels</span>
                <span className="mr-6 cursor-pointer">Resorts</span>
                <span className="mr-6 cursor-pointer">Appartments</span>
                <span className="mr-6 cursor-pointer">Villas</span>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-5">
                {hotels.map(hotel => (
                    <div key={hotel.id} onClick={() => handleHotelClick(hotel)} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer">
                        <img src={hotel.image} alt={hotel.name} className="w-full h-70 object-cover" />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold text-gray-800">{hotel.name}</h2>
                            <p className="text-sm text-gray-600"> <i className="fa fa-location-dot"></i>{hotel.location}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < hotel.stars ? "text-yellow-500" : "text-gray-300"}>★</span>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">({hotel.views} views)</span>
                            </div>
                            <p className="text-md font-medium  text-green-600 mt-2">${hotel.price} /night</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Hotels;
