import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Hotels from "./pages/hotels/Hotels";
import Header from "./components/Header";
import Filter from "./components/Filter";
import HotelDetails from "./pages/hotels/HotelDetails";
import Eating from "./pages/EatingOut/Eating";
import EatingDetails from "./pages/EatingOut/EatingDeatils";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
        <Header />
             <div className="flex justify-center">
                <Filter />
        </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/eating-out" element={<Eating />} />
        <Route path="/restaurant/:id" element={<EatingDetails />} />
      </Routes>
    </div>
  )
}

export default App;