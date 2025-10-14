// src/App.jsx

import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Hotels from "./pages/hotels/Hotels";
import Header from "./components/Header";
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
import CarRentalHistory from "./pages/Cars/CarRentalHistory";
import Filter from "./components/Filter";
import { FilterProvider } from "./context/FilterProvider";
import { getFilterSettingsForPath } from "./context/filterSettings";
import { CartProvider } from "./context/CartContext.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Register from "./pages/Auth/Register.jsx";
import Login from "./pages/Auth/Login.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Footer from "./components/footer.jsx";
import Whatsapp from "./components/Whatsapp";

const AppContent = () => {
  const location = useLocation();
  const { show } = getFilterSettingsForPath(location.pathname);

  return (
    <>
      <Header />
      {show && (
        <section className="max-w-8xl mx-auto px-6 md:px-10 lg:px-16 xl:px-20 mt-6">
          <Filter />
        </section>
      )}
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
        <Route
          path="/car-rental-history"
          element={
            <ProtectedRoute>
              <CarRentalHistory />
            </ProtectedRoute>
          }
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sign-in" element={<Login />} />
      </Routes>
      <Whatsapp
        phoneNumber="2348012345678"
        message="Hello! I have a question about Travooz."
      />
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <FilterProvider>
          <div className="min-h-screen bg-gray-50">
            <AppContent />
          </div>
        </FilterProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
