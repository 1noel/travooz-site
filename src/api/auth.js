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
    return (
      data?.message ||
      data?.error ||
      data?.errors?.[0] ||
      (Array.isArray(data?.errors)
        ? data.errors.join(", ")
        : typeof data?.errors === "object"
        ? Object.values(data.errors).flat().join(", ")
        : null)
    );
  } catch {
    return null;
  }
};

const extractToken = (payload) =>
  payload?.token ||
  payload?.access_token ||
  payload?.data?.token ||
  payload?.data?.access_token ||
  payload?.data?.authToken ||
  payload?.authToken ||
  null;

const extractUser = (payload) =>
  payload?.user || payload?.data?.user || payload?.data || null;

export const authServices = {
  register: async (details) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(details),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (await extractErrorMessage(response)) ||
          data?.message ||
          "Failed to create account.";
        throw new Error(message);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Registration failed.",
      };
    }
  },

  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (await extractErrorMessage(response)) ||
          data?.message ||
          "Failed to sign in.";
        throw new Error(message);
      }

      const token = extractToken(data);
      const user = extractUser(data) || { email };

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
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed.",
      };
    }
  },
};

export default authServices;
