import React from "react";
import logo from "../assets/images/travooz_logo_black.png";
import mtn from "../assets/images/mtn.svg";
import visa from "/src/assets/images/visa.png";
import master from "/src/assets/images/master.png";
import paypal from "/src/assets/images/paypal.png";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="flex flex-col space-y-4">
            <img src={logo} alt="Travooz Logo" className="w-40" />
            <p className="text-sm text-gray-600">
              We are a company dedicated to providing the best travel
              experiences in Rwanda and beyond.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Follow us:</span>
              <div className="flex items-center space-x-3">
                <a
                  href="#"
                  className="text-gray-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-gray-200"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-gray-200"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-gray-200"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-gray-200"
                  aria-label="WhatsApp"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/hotels"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Hotels
                </a>
              </li>
              <li>
                <a
                  href="/eating-out"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Restaurants
                </a>
              </li>
              <li>
                <a
                  href="/activities"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Activities
                </a>
              </li>
              <li>
                <a
                  href="/tour-packages"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Tour Packages
                </a>
              </li>
              <li>
                <a
                  href="/cars"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Car Rental
                </a>
              </li>
              <li>
                <a
                  href="/blogs"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Travel Blogs
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Contact Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <i className="fa fa-phone text-green-600"></i>
                <span className="text-gray-600">+250 788 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa fa-envelope text-green-600"></i>
                <span className="text-gray-600">info@travooz.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa fa-clock text-green-600"></i>
                <span className="text-gray-600">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fa fa-map-marker-alt text-green-600"></i>
                <span className="text-gray-600">Kigali, Rwanda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-sm text-gray-500">We accept:</span>
              <div className="flex items-center space-x-3">
                <img
                  src={mtn}
                  alt="MTN Mobile Money"
                  className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                />
                <img
                  src={visa}
                  alt="Visa"
                  className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                />
                <img
                  src={master}
                  alt="Mastercard"
                  className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                />
                <img
                  src={paypal}
                  alt="PayPal"
                  className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-green-600 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-green-600 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-green-600 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © 2024 Travooz. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
