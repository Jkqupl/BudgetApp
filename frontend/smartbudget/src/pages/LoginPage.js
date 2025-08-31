import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const { signInUser } = UserAuth();
    const Navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const result = await signInUser(email, password);
            if (result && result.success) {
                Navigate("/profile");
            } else {
                setError("Incorrect email or password. Please try again.");
            }
        } catch (err) {
            setError("Incorrect email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSignIn} className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
                
                <p className="mb-2">
                    Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Register</Link>
                </p>
                <p className="mb-6">
                    Want to go back? <Link to="/" className="text-blue-500 hover:underline">Home</Link>
                </p>

                <div className="max-w-md mx-auto mt-4">
                    {/* Email Input */}
                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email}
                        placeholder="Email" 
                        type="email" 
                        required
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />

                    {/* Password Input with View Toggle */}
                    <div className="relative mb-4">
                        <input 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password}
                            placeholder="Password" 
                            type={showPassword ? "text" : "password"} 
                            required
                            className="w-full p-2 pr-12 border border-gray-300 rounded"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                // Eye slash icon (hide password)
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                            ) : (
                                // Eye icon (show password)
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !email || !password} 
                        className={`w-full p-2 rounded transition-colors ${
                            loading || !email || !password
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>

                    {error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SignIn;