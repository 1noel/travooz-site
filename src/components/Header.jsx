import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";
import logo from "../assets/images/travooz_logo.png";
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

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-green-500 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 w-32">
            <Link to="/" className="text-2xl font-bold tracking-wider">
              <img src={logo} alt="Travooz Logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavLink to="/blogs">
              <i className="fa fa-newspaper"></i>
              <span>Travel Blogs</span>
            </NavLink>
            <NavLink to="/help">
              <i className="fa fa-question-circle"></i>
              <span>Help</span>
            </NavLink>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              <i className="fa fa-shopping-cart"></i>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-green-500 text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-green-400"></div>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-600 transition-colors">
                  <i className="fa fa-user-circle"></i>
                  <span>{user?.name || "Account"}</span>
                  <i className="fa fa-chevron-down text-xs opacity-70"></i>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <a
                    href="#"
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/sign-in"
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-green-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4">
              <i className="fa fa-shopping-cart text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-green-500 text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-600 focus:outline-none"
            >
              <i
                className={`fa ${
                  isMobileMenuOpen ? "fa-times" : "fa-bars"
                } text-xl`}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/blogs" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fa fa-newspaper w-5"></i>
              <span>Travel Blogs</span>
            </NavLink>
            <NavLink to="/help" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fa fa-question-circle w-5"></i>
              <span>Help</span>
            </NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-green-400">
            {isAuthenticated ? (
              <div className="px-2 space-y-2">
                <div className="flex items-center px-3 mb-3">
                  <i className="fa fa-user-circle text-2xl mr-3"></i>
                  <div>
                    <div className="text-base font-medium text-white">
                      {user?.name || "Account"}
                    </div>
                    <div className="text-sm font-medium text-green-200">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link
                  to="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-green-600"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block bg-white text-green-500 px-3 py-2 rounded-md text-base font-medium text-center"
                >
                  Register
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
