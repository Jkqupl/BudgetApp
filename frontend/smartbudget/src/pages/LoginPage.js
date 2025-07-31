import React,{useState} from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[error, setError] = useState("");
    const[loading, setLoading] = useState("");

    const {session, signInUser} = UserAuth();
    console.log(session);
    const Navigate = useNavigate();
    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        try{
            const result = await signInUser(email, password);
            if (result.success) {
                Navigate("/profile");
            } 
        } catch (err) {
              setError("Failed to create an account. Please try again.");
        }finally {
            setLoading(false);  
        }
    };
  return (
    <div>
      <form onSubmit = {handleSignIn} className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <p>
            Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Register</Link>
        </p>
        <div className="max-w-md mx-auto mt-4">
            <input onChange={(e) => setEmail(e.target.value) } placeholder="Email" type = "email" className="w-full p-2 border border-gray-300 rounded mb-4"/>
            <input onChange = {(e) => setPassword(e.target.value)} placeholder="Password" type = "password" className="w-full p-2 border border-gray-300 rounded mb-4"/>
            <button type="submit" disabled = {loading} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Sign In 
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </form>
    </div>
  );
}

export default SignIn;