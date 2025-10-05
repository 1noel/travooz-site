import { API_BASE_URL } from "../config";

// Blog API Services
export const blogServices = {
  // Fetch all blogs
  fetchBlogs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/blogs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blogs = await response.json();
      return { data: blogs, success: true };
    } catch (error) {
      console.error("Error fetching blogs:", error);
      return { data: [], success: false, error: error.message };
    }
  },

  // Get single blog by ID
  getBlogById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/blogs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blogs = await response.json();
      const blog = blogs.find((b) => b.blog_id === parseInt(id));

      if (!blog) {
        throw new Error("Blog not found");
      }

      return { data: blog, success: true };
    } catch (error) {
      console.error("Error fetching blog:", error);
      return { data: null, success: false, error: error.message };
    }
  },
};

// Transform blog data for frontend use
export const transformBlogData = (blog) => {
  if (!blog) return null;

  // Get the main image (first image or ordered image)
  const mainImage =
    blog.images && blog.images.length > 0
      ? `${API_BASE_URL}${blog.images[0].image_path}`
      : "/images/default-blog.jpg";

  // Transform all images
  const images = blog.images
    ? blog.images.map((img) => ({
        id: img.image_id,
        url: `${API_BASE_URL}${img.image_path}`,
        type: img.image_type,
        order: img.image_order,
      }))
    : [];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return {
    id: blog.blog_id,
    title: blog.title,
    author: blog.outhor || blog.author, // Handle potential typo in API
    date: formatDate(blog.date),
    description: blog.description,
    time: blog.time,
    mainImage,
    images,
    slug: blog.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  };
};

// Get reading time estimation
export const getReadingTime = (description) => {
  if (!description) return "2 min read";

  const wordsPerMinute = 200;
  const words = description.split(" ").length;
  const readingTime = Math.ceil(words / wordsPerMinute);

  return `${readingTime} min read`;
};

export default blogServices;
