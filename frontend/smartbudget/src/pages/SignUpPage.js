import React,{useState} from "react";
import { Link } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[error, setError] = useState("");
    const[loading, setLoading] = useState("");

    const {session, signUpNewUser,updateUserProfile} = UserAuth();
    console.log(session);
    const Navigate = useNavigate();
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try{
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
        }finally {
            setLoading(false);  
        }
    };
  return (
    <div>
      <form onSubmit = {handleSignUp} className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <p>
            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
        <div className="max-w-md mx-auto mt-4">
            <input onChange={(e) => setEmail(e.target.value) } placeholder="Email" type = "email" className="w-full p-2 border border-gray-300 rounded mb-4"/>
            <input onChange = {(e) => setPassword(e.target.value)} placeholder="Password" type = "password" className="w-full p-2 border border-gray-300 rounded mb-4"/>
            <button type="submit" disabled = {loading} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Sign Up 
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </form>
    </div>
  );
}

export default SignUp;