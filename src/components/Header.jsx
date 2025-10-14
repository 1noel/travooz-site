import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";
import { categoryServices } from "../api/categories_api";
import { useFilterContext } from "../context/useFilterContext";
import logo from "../assets/images/travooz_logo_black.png";
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { activeCategory, setActiveCategory } = useFilterContext();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/", { replace: true });
  };

  // Category configuration logic
  const resolveCategoryConfig = (categoryName) => {
    const normalizedName = categoryName.toLowerCase();

    if (normalizedName.includes("eating")) {
      return { route: "/eating-out", filterKey: "eatingOut" };
    }
    if (normalizedName.includes("activities")) {
      return { route: "/activities", filterKey: "activities" };
    }
    if (normalizedName.includes("tour") || normalizedName.includes("package")) {
      return { route: "/tour-packages", filterKey: "tourPackages" };
    }
    if (normalizedName.includes("car") || normalizedName.includes("rental")) {
      return { route: "/cars", filterKey: "carRental" };
    }
    if (
      normalizedName.includes("rest") ||
      normalizedName.includes("stay") ||
      normalizedName.includes("hotel")
    ) {
      return { route: "/hotels", filterKey: "restStay" };
    }
    if (normalizedName.includes("blog")) {
      return { route: "/blogs", filterKey: "default" };
    }
    return { route: null, filterKey: null };
  };

  // Dynamic icon mapping
  const getIconForCategory = (categoryName) => {
    const iconMap = {
      Activities: "fa fa-person-hiking",
      "Eating Out": "fa fa-utensils",
      "Nightlife and entertainment": "fa fa-cocktail",
      "Rest & Stay": "fa fa-bed",
      "Car Rental": "fa fa-car",
      "Tour Packages": "fa fa-map-marked-alt",
      Hospital: "fa fa-hospital",
      "Forex Bureau": "fa fa-exchange-alt",
    };
    return iconMap[categoryName] || "fa fa-tag";
  };

  // Handle category click navigation
  const handleCategoryClick = (categoryName) => {
    const { route, filterKey } = resolveCategoryConfig(categoryName);

    if (filterKey) {
      setActiveCategory(filterKey);
    }

    if (route) {
      navigate(route);
    }
    setIsMobileMenuOpen(false);
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryServices.fetchCategories();

        if (response?.data && Array.isArray(response.data)) {
          const activeCategories = response.data
            .filter((category) => category.status === "active")
            .map((category) => ({
              id: category.category_id,
              name: category.name,
              icon: getIconForCategory(category.name),
              description: category.description,
              image: category.image,
            }));

          setCategories(activeCategories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
    <header className="bg-white text-black shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-green-600 text-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            {/* Contact Information */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <i className="fa fa-phone text-xs"></i>
                <span>+250 788 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa fa-envelope text-xs"></i>
                <span>info@travooz.com</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa fa-clock text-xs"></i>
                <span>24/7 Support</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline text-xs opacity-80">Follow us:</span>
              <div className="flex items-center space-x-2">
                <a
                  href="#"
                  className="hover:text-blue-200 transition-colors p-1"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f text-xs"></i>
                </a>
                <a
                  href="#"
                  className="hover:text-blue-200 transition-colors p-1"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter text-xs"></i>
                </a>
                <a
                  href="#"
                  className="hover:text-blue-200 transition-colors p-1"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram text-xs"></i>
                </a>
                <a
                  href="#"
                  className="hover:text-blue-200 transition-colors p-1"
                  aria-label="WhatsApp"
                >
                  <i className="fab fa-whatsapp text-xs"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 w-32">
            <Link to="/" className="text-2xl font-bold tracking-wider">
              <img src={logo} alt="Travooz Logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {loading ? (
              // Loading skeleton
              <>
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="px-3 py-2 rounded-md bg-gray-200 animate-pulse h-9 w-24" />
                ))}
              </>
            ) : (
              // Categories
              categories.slice(0, 6).map((category) => {
                const { filterKey } = resolveCategoryConfig(category.name);
                const isActive = filterKey && filterKey === activeCategory;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                    }`}
                    title={category.description}
                  >
                    <i className={`${category.icon} text-xs`}></i>
                    <span>{category.name}</span>
                  </button>
                );
              })
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              <i className="fa fa-shopping-cart"></i>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">
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
          <div className="lg:hidden flex items-center">
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
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Categories in mobile menu */}
            {loading ? (
              <div className="flex flex-col space-y-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="px-3 py-2 rounded-md bg-gray-200 animate-pulse h-10" />
                ))}
              </div>
            ) : (
              categories.map((category) => {
                const { filterKey } = resolveCategoryConfig(category.name);
                const isActive = filterKey && filterKey === activeCategory;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? "bg-green-600 text-white"
                        : "text-white hover:bg-green-600"
                    }`}
                  >
                    <i className={`${category.icon} w-5`}></i>
                    <span>{category.name}</span>
                  </button>
                );
              })
            )}
            
            <div className="border-t border-green-400 mt-4 pt-4">
              <NavLink to="/blogs" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fa fa-newspaper w-5"></i>
                <span>Travel Blogs</span>
              </NavLink>
            </div>
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
