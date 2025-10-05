import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Hotels from "./pages/hotels/Hotels";
import Header from "./components/Header";
import Filter from "./components/Filter";
import HotelDetails from "./pages/hotels/HotelDetails";
import Eating from "./pages/EatingOut/Eating";
import EatingDetails from "./pages/EatingOut/EatingDeatils";
import TourPackages from "./pages/TourPackages/TourPackages";
import TourPackageDetails from "./pages/TourPackages/TourPackageDetails";

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
        <Route path="/tour-packages" element={<TourPackages />} />
        <Route path="/tour-package/:id" element={<TourPackageDetails />} />
      </Routes>
    </div>
  );
};

export default App;
