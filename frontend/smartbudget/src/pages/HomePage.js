import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardImage from "../images/DashboardImage.png";
import { UserAuth } from "../context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  const { signInUser } = UserAuth();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    
    try {
      const result = await signInUser("guest@guest.com", "guest123");
      
      if (result.success) {
        navigate("/dashboard"); // or wherever you want to redirect after login
      } else {
        alert("Demo login failed. Please try again.");
        console.error("Demo login error:", result.error);
      }
    } catch (error) {
      console.error("Demo login error:", error);
      alert("Demo login failed. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      {/* Hero Section */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome to <span className="text-blue-600">Smart Budget</span>
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        Take control of your finances with clear insights into your income,
        spending, and savings goals — all in one place.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow hover:bg-blue-700 transition"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition"
        >
          Sign Up
        </Link>
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {demoLoading ? "Loading..." : "Try Demo"}
        </button>
      </div>
      
      {/* Demo Info */}
      <p className="text-sm text-gray-500 mt-3">
        Try the demo to explore all features without signing up
      </p>

      {/* Preview Section */}
      <div className="mt-12 max-w-3xl w-full bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          See Your Finances Clearly
        </h2>
        <p className="text-gray-500 mb-6">
          From tracking income and expenses to achieving your financial goals,
          Smart Budget gives you the full picture.
        </p>
        <img
          src={DashboardImage}
          alt="Dashboard preview"
          className="rounded-xl shadow"
        />
      </div>
    </div>
  );
}

export default HomePage;