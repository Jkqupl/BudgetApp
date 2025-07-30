import { useState, useEffect } from 'react';
import { Eye, EyeOff, Camera, User, X } from 'lucide-react'; // Added X icon
import { UserAuth } from '../context/AuthContext';

function ProfilePage() {
  const { session, getUserProfile, updateUserProfile, uploadProfilePicture, deleteProfilePicture } = UserAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '••••••••',
    profilePicture: null
  });

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profilePicturePath, setProfilePicturePath] = useState(null); // For deletion tracking

  const [removeProfilePicture, setRemoveProfilePicture] = useState(false); // Flag for deletion

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await getUserProfile(session.user.id);

      if (!result.success) {
        console.error('Error loading profile:', result.error);
        return;
      }

      const profile = result.data;

      setFormData({
        name: profile?.name || '',
        email: session.user.email || '',
        password: '••••••••',
        profilePicture: profile?.profile_picture || null
      });

      if (profile?.profile_picture) {
        setProfilePicturePreview(profile.profile_picture);
        setProfilePicturePath(profile.profile_picture); // Save path
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setRemoveProfilePicture(false); // reset removal flag

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicturePreview(null);
    setProfilePictureFile(null);
    setRemoveProfilePicture(true); // mark picture for removal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let newProfilePictureUrl = formData.profilePicture;

      // If removing existing profile picture
      if (removeProfilePicture && profilePicturePath) {
        const deleteResult = await deleteProfilePicture(
          profilePicturePath.replace(/^.*profile-pictures\//, "profile-pictures/")
        );
        if (!deleteResult.success) {
          throw new Error('Failed to delete profile picture');
        }
        newProfilePictureUrl = null;
      }

      // If uploading a new profile picture
      if (profilePictureFile) {
        const uploadResult = await uploadProfilePicture(profilePictureFile, session.user.id);
        if (!uploadResult.success) {
          throw new Error('Failed to upload profile picture');
        }
        newProfilePictureUrl = uploadResult.data.url;
      }

      const profileData = {
        uuid: session.user.id,
        name: formData.name,
        email: session.user.email,
        profile_picture: newProfilePictureUrl,
        created_at: new Date().toISOString()
      };

      const result = await updateUserProfile(profileData);
      if (!result.success) {
        throw new Error('Failed to update profile');
      }

      alert('Profile updated successfully!');
      setProfilePictureFile(null);
      setRemoveProfilePicture(false);

      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Profile Settings</h1>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300">
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>

            {/* Camera Icon */}
            <label
              htmlFor="profilePicture"
              className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />

            {/* Remove Button (only if picture exists) */}
            {profilePicturePreview && (
              <button
                type="button"
                onClick={handleRemoveProfilePicture}
                className="absolute top-0 left-0 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Click the camera icon to add or change your profile picture <br />
            <span className="text-xs">(Optional)</span>
          </p>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            readOnly
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-500 bg-gray-100 leading-tight cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed here. Contact support if needed.
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={showPassword ? "Current password hidden for security" : formData.password}
              readOnly
              className="shadow appearance-none border rounded w-full py-3 px-4 pr-12 text-gray-500 bg-gray-100 leading-tight cursor-not-allowed"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            For security reasons, passwords cannot be viewed or changed here. Use account settings to update your password.
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          type="submit"
          disabled={saving}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Updating Profile...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
