import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  blogServices,
  transformBlogData,
  getReadingTime,
} from "../../api/blogs";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific blog
        const blogResponse = await blogServices.getBlogById(id);

        if (blogResponse.success && blogResponse.data) {
          const transformedBlog = transformBlogData(blogResponse.data);
          setBlog(transformedBlog);
          setSelectedImage(transformedBlog.mainImage);

          // Fetch all blogs for related blogs
          const allBlogsResponse = await blogServices.fetchBlogs();
          if (allBlogsResponse.success && allBlogsResponse.data) {
            const otherBlogs = allBlogsResponse.data
              .filter((b) => b.blog_id !== parseInt(id))
              .map(transformBlogData)
              .slice(0, 3); // Get 3 related blogs
            setRelatedBlogs(otherBlogs);
          }
        } else {
          setError("Blog not found");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogData();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !blog) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/blogs")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Browse All Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 md:mb-8 flex items-center space-x-3 text-sm">
        <button
          onClick={() => navigate("/")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Home
        </button>
        <span className="text-gray-400">{"/"}</span>
        <button
          onClick={() => navigate("/blogs")}
          className="text-green-600 hover:text-green-800 cursor-pointer font-medium transition-colors"
        >
          Blogs
        </button>
        <span className="text-gray-400">{"/"}</span>
        <span className="text-gray-600 font-medium truncate">{blog.title}</span>
      </nav>

      {/* Article Header */}
      <article>
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 mb-6 md:mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Published on</span>
              <span className="font-semibold">{blog.date}</span>
            </div>
            <span className="text-gray-400">{"/"}</span>
            <span className="text-sm font-medium">
              {getReadingTime(blog.description)}
            </span>
            {blog.time && (
              <>
                <span className="text-gray-400">{"/"}</span>
                <span className="text-sm font-medium">
                  Updated at {blog.time}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-6 md:mb-8">
          <img
            src={selectedImage}
            alt={blog.title}
            className="w-full h-64 md:h-80 lg:h-96 xl:h-[480px] object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Image Gallery */}
        {blog.images && blog.images.length > 1 && (
          <div className="mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Gallery
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {blog.images.map((img, index) => (
                <div
                  key={img.id}
                  className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img.url
                      ? "border-green-500 ring-2 ring-green-200"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <img
                    src={img.url}
                    alt={`${blog.title} gallery ${index + 1}`}
                    className="w-20 h-16 md:w-24 md:h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8 md:mb-10">
          <div className="text-gray-700 leading-relaxed">
            <p className="text-base md:text-lg leading-relaxed">
              {blog.description}
            </p>
          </div>
        </div>

        {/* Sharing */}
        <div className="border-t border-gray-200 pt-6 md:pt-8 mb-8 md:mb-10">
          <div className="flex justify-center">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Share this article
              </h4>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                <button className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Facebook
                </button>
                <button className="bg-blue-400 text-white px-3 md:px-4 py-2 rounded-lg text-sm hover:bg-blue-500 transition-colors">
                  Twitter
                </button>
                <button className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="border-t border-gray-200 pt-8 md:pt-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">
            Related Articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {relatedBlogs.map((relatedBlog) => (
              <article
                key={relatedBlog.id}
                onClick={() => navigate(`/blog/${relatedBlog.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-green-200 group"
              >
                <img
                  src={relatedBlog.mainImage}
                  alt={relatedBlog.title}
                  className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4 md:p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-green-600 transition-colors text-base md:text-lg group-hover:text-green-600">
                    {relatedBlog.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {relatedBlog.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{relatedBlog.date}</span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    <span>{getReadingTime(relatedBlog.description)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <div className="bg-green-50 rounded-xl p-6 md:p-8 text-center border border-green-100 mt-8 md:mt-12 shadow-sm">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Ready to Start Your Adventure?
        </h3>
        <p className="text-gray-600 mb-6 text-base md:text-lg">
          Explore our tour packages and find the perfect travel experience for
          you.
        </p>
        <button
          onClick={() => navigate("/tour-packages")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
        >
          Browse Tour Packages
        </button>
      </div>
    </div>
  );
};

export default BlogDetails;
