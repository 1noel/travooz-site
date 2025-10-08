import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authServices from "../../api/auth";
import { useAuth } from "../../context/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await authServices.login({
      email: email.trim(),
      password,
    });

    if (!response.success) {
      setError(response.error || "Invalid credentials.");
      setLoading(false);
      return;
    }

    login(response.data.user, response.data.token);
    setLoading(false);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="hidden lg:flex lg:col-span-2 bg-green-500 text-white flex-col justify-between p-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome back</h2>
            <p className="text-green-50 leading-relaxed">
              Sign in to manage your bookings, track reservations, and explore
              new travel experiences tailored to you.
            </p>
          </div>
          <div className="mt-12 text-sm text-green-100 space-y-2">
            <p>• Use the same email you registered with.</p>
            <p>• Forgot your password? Contact support for assistance.</p>
            <p>• Your client role grants access to booking features.</p>
          </div>
        </div>

        <div className="lg:col-span-3 p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Sign in to Travooz
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              New here?{" "}
              <Link
                to="/register"
                className="text-green-600 font-medium hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? "bg-green-300 cursor-wait"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
