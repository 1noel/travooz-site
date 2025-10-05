import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Hotels from "./pages/hotels/Hotels";
import Header from "./components/Header";
import Filter from "./components/Filter";
import HotelDetails from "./pages/hotels/HotelDetails";
import Eating from "./pages/EatingOut/Eating";
import EatingDetails from "./pages/EatingOut/EatingDeatils";
import Activities from "./pages/Activities/Activities";
import ActivityDetails from "./pages/Activities/ActivityDetails";
import TourPackages from "./pages/TourPackages/TourPackages";
import TourPackageDetails from "./pages/TourPackages/TourPackageDetails";
import Blogs from "./pages/Blogs/Blogs";
import BlogDetails from "./pages/Blogs/BlogDetails";
import Cars from "./pages/Cars/Cars";
import CarDetails from "./pages/Cars/CarDetails";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex justify-center px-4">
        <Filter />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/eating-out" element={<Eating />} />
        <Route path="/restaurant/:id" element={<EatingDetails />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activities/:id" element={<ActivityDetails />} />
        <Route path="/tour-packages" element={<TourPackages />} />
        <Route path="/tour-package/:id" element={<TourPackageDetails />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car/:id" element={<CarDetails />} />
      </Routes>
    </div>
  );
};

export default App;
