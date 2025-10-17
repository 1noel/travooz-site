import React, { useState, useEffect } from "react";

const AdBanner = ({ banners }) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentBannerIndex((prevIndex) =>
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
        setIsSliding(false);
      }, 500); // slide out duration
    }, 10000); // 10-second cycle

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const { imageUrl, title, description, buttonText, buttonLink } =
    banners[currentBannerIndex];

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden group ${
        isSliding ? "animate-slideOut" : "animate-slideIn"
      }`}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
        <a
          href={buttonLink}
          className="mt-4 inline-block bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
};

export default AdBanner;
