import { API_BASE_URL } from "../config";

const buildHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const extractErrorMessage = async (response) => {
  try {
    const data = await response.clone().json();

    // Handle errors array
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      // If errors are objects with message property
      if (typeof data.errors[0] === "object" && data.errors[0].message) {
        return data.errors.map((e) => e.message).join(", ");
      }
      // If errors are objects with msg property
      if (typeof data.errors[0] === "object" && data.errors[0].msg) {
        return data.errors.map((e) => e.msg).join(", ");
      }
      // If errors are strings
      if (typeof data.errors[0] === "string") {
        return data.errors.join(", ");
      }
      // Return first error as fallback
      return JSON.stringify(data.errors[0]);
    }

    // Handle errors object
    if (typeof data?.errors === "object" && !Array.isArray(data.errors)) {
      return Object.values(data.errors).flat().join(", ");
    }

    // Handle simple message or error
    return data?.message || data?.error || null;
  } catch {
    return null;
  }
};

const extractToken = (payload) =>
  payload?.token ||
  payload?.access_token ||
  payload?.accessToken ||
  payload?.data?.token ||
  payload?.data?.access_token ||
  payload?.data?.accessToken ||
  payload?.data?.tokens?.accessToken ||
  payload?.data?.tokens?.access_token ||
  payload?.data?.authToken ||
  payload?.authToken ||
  null;

const extractUser = (payload) =>
  payload?.user ||
  payload?.data?.user ||
  payload?.data?.data?.user ||
  payload?.data ||
  null;

export const authServices = {
  register: async (details) => {
    try {
      console.log(
        "Auth service - Calling register API:",
        `${API_BASE_URL}/api/v1/users/register`
      );

      const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(details),
      });

      console.log("Auth service - Response status:", response.status);

      const data = await response.json().catch(() => null);
      console.log("Auth service - Response data:", data);

      // Log the errors array if it exists
      if (data?.errors) {
        console.log("Auth service - Validation errors:", data.errors);
        // Log each error individually for clarity
        data.errors.forEach((err, index) => {
          console.log(
            `Auth service - Error ${index + 1}:`,
            JSON.stringify(err, null, 2)
          );
        });
      }

      if (!response.ok) {
        // Try to extract detailed error message
        let message = await extractErrorMessage(response);

        // If extraction failed, try to get from data directly
        if (!message || message === "Validation failed") {
          if (
            data?.errors &&
            Array.isArray(data.errors) &&
            data.errors.length > 0
          ) {
            const firstError = data.errors[0];
            // Try different error formats
            message =
              firstError?.message ||
              firstError?.msg ||
              firstError?.error ||
              JSON.stringify(firstError);
          } else {
            message = data?.message || "Failed to create account.";
          }
        }

        console.error("Auth service - Registration failed:", message);
        throw new Error(message);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Auth service - Registration error:", error);
      return {
        success: false,
        error: error.message || "Registration failed.",
      };
    }
  },

  login: async ({ email, password }) => {
    try {
      console.log(
        "Auth service - Calling login API:",
        `${API_BASE_URL}/api/v1/users/login`
      );

      const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ email, password }),
      });

      console.log("Auth service - Response status:", response.status);

      const data = await response.json().catch(() => null);
      console.log("Auth service - Response data:", data);

      if (!response.ok) {
        const message =
          (await extractErrorMessage(response)) ||
          data?.message ||
          "Failed to sign in.";
        console.error("Auth service - Login failed:", message);
        throw new Error(message);
      }

      const token = extractToken(data);
      const user = extractUser(data) || { email };

      console.log(
        "Auth service - Extracted token:",
        token ? "Token found" : "No token"
      );
      console.log("Auth service - Extracted user:", user);

      if (!token) {
        throw new Error("Authentication token missing in response.");
      }

      return {
        success: true,
        data: {
          token,
          user,
        },
      };
    } catch (error) {
      console.error("Auth service - Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed.",
      };
    }
  },
};

export default authServices;
