import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";   

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const[session, setSession] = useState(undefined)

    //Sign up
    const signUpNewUser = async (email,password) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        if (error) {
            console.error("Error signing up:", error);
            return { success : false, error };
        } 
        return { success: true, data };
    };

    //Sign in
    const signInUser = async (email, password) => {
        try{
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (error) {
                console.error("Error signing in:", error);
                return { success: false, error };
            }
            console.log("User signed in:", data);
            return { success: true, data };
        }catch (error) {
            console.error("Error signing in:", error);
        }
       
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: {session} }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
        });
    }, []);

    //Sign out
    const signOut = () => {
        const { error } = supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
            return { success: false, error };
        }
    }
    
    // Get user profile from your custom users table
    const getUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                console.error("Error fetching profile:", error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (error) {
            console.error("Error fetching profile:", error);
            return { success: false, error };
        }
    };

    // Update/create user profile in your custom users table
    const updateUserProfile = async (profileData) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .upsert(profileData, { 
                    onConflict: 'uuid',
                    returning: 'minimal' 
                });

            if (error) {
                console.error("Error updating profile:", error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (error) {
            console.error("Error updating profile:", error);
            return { success: false, error };
        }
    };

    // Upload profile picture
    const uploadProfilePicture = async (file, userId) => {
        console.log('Uploading to path:', file);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `profile-pictures/${fileName}`;

            const { error } = await supabase.storage
            .from('profile-pictures')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (error) return { success: false, error };

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(filePath);

            return { success: true, data: { url: publicUrl } };
        } catch (error) {
            return { success: false, error };
        }
        
    };

    // Delete profile picture
    const deleteProfilePicture = async (filePath) => {
        try {
            const { error } = await supabase.storage
                .from('profile-pictures')
                .remove([filePath]);

            if (error) {
                console.error("Error deleting file:", error);
                return { success: false, error };
            }

            return { success: true };
        } catch (error) {
            console.error("Error deleting profile picture:", error);
            return { success: false, error };
        }
    };

    return(
        <AuthContext.Provider value = {{session, signUpNewUser, signOut,signInUser, updateUserProfile, 
                                        uploadProfilePicture, deleteProfilePicture, getUserProfile}}>
            {children}
        </AuthContext.Provider>
    )
}


    export const UserAuth = () => {
        return useContext(AuthContext);
    }
