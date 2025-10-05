import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  blogServices,
  transformBlogData,
  getReadingTime,
} from "../../api/blogs";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await blogServices.fetchBlogs();

        if (response.success && response.data) {
          const transformedBlogs = response.data.map(transformBlogData);
          setBlogs(transformedBlogs);
        } else {
          setError("Failed to load blogs");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleBlogClick = (blog) => {
    navigate(`/blog/${blog.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Unable to Load Blogs
          </h1>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the blog posts. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-6 md:py-10">
      {/* Header */}
      <div className="text-center mb-10 md:mb-14">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Travel Stories & Insights
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Discover amazing destinations, travel tips, and inspiring stories from
          fellow travelers. Let our guides inspire your next adventure.
        </p>
      </div>

      {/* Featured Blog */}
      {blogs.length > 0 && (
        <div className="mb-10 md:mb-14">
          <div
            onClick={() => handleBlogClick(blogs[0])}
            className="relative cursor-pointer group overflow-hidden rounded-xl shadow-lg bg-white border border-gray-100 hover:border-green-200"
          >
            <div className="grid lg:grid-cols-2 items-center">
              <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
                <img
                  src={blogs[0].mainImage}
                  alt={blogs[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4">
                  <span className="bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                    Featured Story
                  </span>
                  <span className="text-gray-500 text-sm font-medium">
                    {blogs[0].date}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {getReadingTime(blogs[0].description)}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors leading-tight">
                  {blogs[0].title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3 text-sm md:text-base">
                  {blogs[0].description}
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm md:text-base">
                  Read Full Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      {blogs.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {blogs.slice(1).map((blog) => (
            <article
              key={blog.id}
              onClick={() => handleBlogClick(blog)}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-green-200"
            >
              {/* Blog Image */}
              <div className="relative overflow-hidden">
                <img
                  src={blog.mainImage}
                  alt={blog.title}
                  className="w-full h-48 md:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Blog Content */}
              <div className="p-4 md:p-6">
                {/* Meta Info */}
                <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                  <span className="font-medium">{blog.date}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{getReadingTime(blog.description)}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors leading-tight line-clamp-2">
                  {blog.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3 text-sm md:text-base">
                  {blog.description}
                </p>

                {/* Read More Link */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-green-600 font-semibold group-hover:text-green-700 transition-colors text-sm md:text-base">
                    Read Full Article
                  </span>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <span className="text-green-600 group-hover:text-white transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Empty State */}
      {blogs.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Blog Posts Available
          </h3>
          <p className="text-gray-500">
            Check back soon for exciting travel stories and insights.
          </p>
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="bg-green-50 rounded-xl p-6 md:p-8 text-center border border-green-100 mt-12 md:mt-16">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Stay Updated with Travel Tips
        </h3>
        <p className="text-gray-600 mb-6 text-base md:text-lg">
          Subscribe to our newsletter for the latest travel stories and
          destination guides.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-sm md:text-base"
          />
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg text-sm md:text-base">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
