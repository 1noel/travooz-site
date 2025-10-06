import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-green-500 text-white p-4 px-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <h1 className="text-xl md:text-2xl font-bold">Travooz</h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center gap-3 lg:gap-5">
          <span className="text-sm lg:text-base">RWF</span>
          <span className="text-sm lg:text-base">Help</span>
          <Link to="/blogs" className="text-sm lg:text-base">
            Travel Blogs
          </Link>
          <div className="space-x-2 lg:space-x-4">
            <button className="border border-white px-3 lg:px-5 py-1 rounded-md text-sm lg:text-base">
              Register
            </button>
            <button className="bg-white text-green-500 px-3 lg:px-5 py-1.5 rounded-md text-sm lg:text-base">
              Sign in
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-green-400">
          <div className="flex flex-col space-y-3">
            <span className="text-sm">RWF</span>
            <span className="text-sm">Help</span>
            <Link to="/blogs" className="text-sm">
              Travel Blogs
            </Link>
            <div className="flex space-x-3">
              <button className="border border-white px-4 py-2 rounded-md text-sm flex-1">
                Register
              </button>
              <button className="bg-white text-green-500 px-4 py-2 rounded-md text-sm flex-1">
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
