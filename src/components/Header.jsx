import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <header className="bg-green-500 text-white p-4 px-10">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold">
          Travooz
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center gap-3 lg:gap-5">
          <span className="text-sm lg:text-base">RWF</span>
          <span className="text-sm lg:text-base">Help</span>
          <Link to="/blogs" className="text-sm lg:text-base">
            Travel Blogs
          </Link>
          {isAuthenticated ? (
            <Link
              to="/cart"
              className="relative text-sm lg:text-base flex items-center gap-2"
            >
              <span>Cart</span>
              <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-xs font-semibold bg-white text-green-600 rounded-full">
                {cartCount}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => navigate("/sign-in")}
              className="relative text-sm lg:text-base flex items-center gap-2 opacity-70 hover:opacity-100"
              title="Sign in to access cart"
            >
              <span>Cart</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </button>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="hidden lg:flex flex-col text-xs text-white/80 leading-tight">
                <span className="text-sm text-white font-semibold">
                  {user?.name || user?.email || "Client"}
                </span>
                <span>Client account</span>
              </div>
              <button
                onClick={handleLogout}
                className="border border-white px-3 lg:px-5 py-1.5 rounded-md text-sm lg:text-base"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-x-2 lg:space-x-4">
              <Link
                to="/register"
                className="border border-white px-3 lg:px-5 py-1 rounded-md text-sm lg:text-base"
              >
                Register
              </Link>
              <Link
                to="/sign-in"
                className="bg-white text-green-500 px-3 lg:px-5 py-1.5 rounded-md text-sm lg:text-base"
              >
                Sign in
              </Link>
            </div>
          )}
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
            {isAuthenticated ? (
              <Link
                to="/cart"
                className="text-sm flex items-center justify-between border border-white/20 rounded-md px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Cart</span>
                <span className="ml-3 inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 text-xs font-semibold bg-white text-green-600 rounded-full">
                  {cartCount}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/sign-in");
                }}
                className="text-sm flex items-center justify-between border border-white/20 rounded-md px-4 py-2 opacity-70"
              >
                <span>Cart (Sign in required)</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </button>
            )}
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border border-white/20 rounded-md px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {user?.name || user?.email || "Client"}
                    </p>
                    <p className="text-xs text-white/80">Client account</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white text-green-500 px-4 py-2 rounded-md text-sm font-semibold"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border border-white px-4 py-2 rounded-md text-sm flex-1 text-center"
                >
                  Register
                </Link>
                <Link
                  to="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-white text-green-500 px-4 py-2 rounded-md text-sm flex-1 text-center"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
