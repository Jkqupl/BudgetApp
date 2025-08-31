import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);
    
    const { signUpNewUser, updateUserProfile } = UserAuth();
    const Navigate = useNavigate();

    // Password validation function
    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        return requirements;
    };

    const passwordRequirements = validatePassword(password);
    const isPasswordValid = Object.values(passwordRequirements).every(req => req);

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        if (!isPasswordValid) {
            setError("Please ensure your password meets all requirements.");
            return;
        }

        setLoading(true);
        setError("");
        
        try {
            const result = await signUpNewUser(email, password);
            if (result.success) {
                Navigate("/profile");
                await updateUserProfile({
                    uuid: result.data.user.id,
                    email: email,
                    created_at: new Date().toISOString()
                });
            }
        } catch (err) {
            setError("Failed to create an account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSignUp} className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                
                <p className="mb-2">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
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
                    <div className="relative mb-2">
                        <input 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password}
                            placeholder="Password" 
                            type={showPassword ? "text" : "password"} 
                            required
                            onFocus={() => setShowPasswordHelp(true)}
                            className="w-full p-2 pr-12 border border-gray-300 rounded"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Password Requirements Popup */}
                    {(showPasswordHelp || password.length > 0) && (
                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                            <h4 className="font-semibold mb-2 text-gray-700">Password Requirements:</h4>
                            <ul className="space-y-1">
                                <li className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-red-500'}`}>
                                    <span className="mr-2">{passwordRequirements.length ? '✓' : '✗'}</span>
                                    At least 8 characters long
                                </li>
                                <li className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                                    <span className="mr-2">{passwordRequirements.uppercase ? '✓' : '✗'}</span>
                                    At least one uppercase letter (A-Z)
                                </li>
                                <li className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                                    <span className="mr-2">{passwordRequirements.lowercase ? '✓' : '✗'}</span>
                                    At least one lowercase letter (a-z)
                                </li>
                                <li className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-red-500'}`}>
                                    <span className="mr-2">{passwordRequirements.number ? '✓' : '✗'}</span>
                                    At least one number (0-9)
                                </li>
                                <li className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : 'text-red-500'}`}>
                                    <span className="mr-2">{passwordRequirements.special ? '✓' : '✗'}</span>
                                    At least one special character (!@#$%^&*...)
                                </li>
                            </ul>
                            {isPasswordValid && (
                                <p className="mt-2 text-green-600 font-semibold">✓ Password meets all requirements!</p>
                            )}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading || !isPasswordValid || !email} 
                        className={`w-full p-2 rounded transition-colors ${
                            loading || !isPasswordValid || !email
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
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

export default SignUp;