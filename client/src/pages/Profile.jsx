import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  updateUserSuccess,
  updateUserStart,
  updateUserFailure,
  resetUserStatus,
  deleteUserFailure,
  deleteUserStart,
  deleteuserSuccess,
  singOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";

// Default image shown when the user has no profile picture.
const defaultAvatar = "/default-avatar.svg";

const Profile = () => {
  // Get the current user and loading state from Redux.
  const { currentUser, loading } = useSelector((state) => state.user);

  // Store the profile form values.
  // If user data already exists, use it as the initial value.
  const [formData, setFormData] = useState(() => ({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
    photo: currentUser?.photo || defaultAvatar,
  }));

  // Store the new image selected by the user.
  const [selectedFile, setSelectedFile] = useState(null);

  // Store the image URL shown in the profile picture preview.
  const [previewUrl, setPreviewUrl] = useState(
    currentUser?.photo || defaultAvatar,
  );

  // Store an error message.
  const [updateError, setUpdateError] = useState("");

  // Store a success message.
  const [success, setSuccess] = useState("");

  const [showUserListings, setShowUserListings] = useState([]);
  const [showListingsError, setShowListingsError] = useState(false);

  // useRef is used to access the hidden file input.
  const fileRef = useRef(null);

  // Used to dispatch Redux actions.
  const dispatch = useDispatch();

  // Reset old Redux status when the Profile page loads.
  useEffect(() => {
    dispatch(resetUserStatus());
  }, [dispatch]);

  // Update formData whenever the user changes an input.
  const handleChange = (e) => {
    setFormData((previous) => ({
      // Keep the existing form values.
      ...previous,

      // Update only the input that was changed.
      // Example: id="username" -> username: "newName"
      [e.target.id]: e.target.value,
    }));
  };

  // Handle selecting a new profile picture.
  const handleFileChange = (e) => {
    // Get the first selected file.
    const file = e.target.files?.[0];

    // Stop if no file was selected.
    if (!file) return;

    // Make sure the selected file is an image.
    if (!file.type.startsWith("image/")) {
      setUpdateError("Please select an image file.");
      return;
    }

    // Make sure the image is smaller than 5 MB.
    if (file.size > 5 * 1024 * 1024) {
      setUpdateError("Please select an image smaller than 5 MB.");
      return;
    }

    // Clear any previous error.
    setUpdateError("");

    // Save the selected file.
    setSelectedFile(file);

    // Create a temporary URL so we can show the image immediately.
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Handle submitting the profile update form.
  const handleSubmit = async (e) => {
    // Prevent the page from refreshing.
    e.preventDefault();

    // Clear old messages.
    setUpdateError("");
    setSuccess("");

    try {
      // Tell Redux that the update process has started.
      dispatch(updateUserStart());

      const updateData = new FormData();
      updateData.append("username", formData.username.trim());
      updateData.append("email", formData.email.trim());
      if (selectedFile) updateData.append("profileImage", selectedFile);

      // Only send a password if the user entered a new one.
      if (formData.password.trim()) {
        updateData.append("password", formData.password);
      }

      // Send the updated user information to the backend.
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",

        // Send cookies such as the JWT access token.
        credentials: "include",
        body: updateData,
      });

      // Convert the server response from JSON into a JavaScript object.
      const data = await res.json();

      // Check if the backend returned an error.
      if (!res.ok || data.success === false) {
        const message = data.message || "Could not update profile";

        // Show the error message on the page.
        setUpdateError(message);

        // Tell Redux that the update failed.
        dispatch(updateUserFailure(message));

        return;
      }

      // Update the user information stored in Redux.
      dispatch(updateUserSuccess(data));

      // Update the local form data with the new user information.
      setFormData((previous) => ({
        ...previous,

        // Clear the password field after updating.
        password: "",

        // Use the new photo returned by the backend.
        photo: data.photo || formData.photo,
      }));

      // Clear the selected file.
      setSelectedFile(null);

      // Show a success message.
      setSuccess("Profile updated successfully.");
    } catch (err) {
      // Show any unexpected error.
      setUpdateError(err.message);

      // Tell Redux that the update failed.
      dispatch(updateUserFailure(err.message));
    }
  };

  // Handle deleting the user account.
  const handleDeleteUser = async () => {
    try {
      // Tell Redux that the delete process has started.
      // This can be used to set loading = true.
      dispatch(deleteUserStart());

      // Send a DELETE request to the backend.
      // currentUser._id tells the backend which user to delete.
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      // Convert the server response from JSON into a JavaScript object.
      const data = await res.json();

      // Check if the backend returned an error.
      if (data.success === false) {
        // Store the error message in Redux.
        dispatch(deleteUserFailure(data.message || "Could not delete account"));

        // Stop the function if deleting failed.
        return;
      }

      // If deletion was successful, update Redux with the response.
      dispatch(deleteuserSuccess(data));
    } catch (err) {
      // If something unexpected goes wrong,
      // store the error message in Redux.
      dispatch(deleteUserFailure(err.message));
    }
  };

  // Handle signing out the user.
  const handleSignOut = async () => {
    try {
      dispatch(singOutUserStart());

      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message || "Could not sign out"));
        return;
      }

      dispatch(signOutUserSuccess());
    } catch (err) {
      dispatch(signOutUserFailure(err.message));
    }
  };

  // Showing the user's listings.
  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`); // Fetch the user's listings from the backend.
      const data = await res.json();

      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setShowUserListings(data);
    } catch (err) {
      console.error("Error showing listings:", err);
      setShowListingsError(true);
    }
  };

  // Handle deleting a listing.
  const handleDeleteListing = async (listingId) => {
    try {
      // Send a DELETE request to the backend to delete the listing.
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success === false) {
        console.error("Error deleting listing:", data.message);
        return;
      }

      setShowUserListings(
        (prevListings) =>
          prevListings.filter((listing) => listing._id !== listingId), // Remove the deleted listing from the state.
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 
          When the profile picture is clicked,
          open the hidden file input.
        */}
        <img
          onClick={() => fileRef.current.click()}
          src={previewUrl}
          alt="Profile"
          // If the image fails to load, show the default avatar.
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = defaultAvatar;
          }}
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center"
        />

        {/* 
          Hidden file input.
          The user opens this by clicking the profile picture.
        */}
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Username input */}
        <input
          type="text"
          placeholder="username"
          value={formData.username}
          className="border p-3 rounded-lg"
          id="username"
          onChange={handleChange}
        />

        {/* Email input */}
        <input
          type="email"
          placeholder="email"
          value={formData.email}
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="password"
          value={formData.password}
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />

        {/* 
          Disable the button while the update is running.
          Change the text depending on the loading state.
        */}
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "updating..." : "update"}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>
      {/* Show error message if there is an error. */}
      {updateError && <p className="text-red-700 mt-4">{updateError}</p>}
      {/* Show success message after a successful update. */}
      {success && <p className="text-green-700 mt-4">{success}</p>}
      <div className="flex justify-between">
        {/* Delete account option */}
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>

        {/* Sign out option */}
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>
      {/* Show the user's listings when the button is clicked. */}
      <button onClick={handleShowListings} className="text-green-700 w-full">
        Show Listings
      </button>
      <p>{showListingsError ? "Error showing listings" : ""}</p>
      {showUserListings &&
        showUserListings.length > 0 &&
        showUserListings.map((listing) => (
          <div
            key={listing._id}
            className="border border-slate-500 m-2 rounded-lg p-3 flex justify-between items-center gap-2"
          >
            <Link to={`/listing/${listing._id}`}>
              <img
                src={listing.images[0]}
                alt="listing cover"
                className="h-16 w-16 object-contain"
              />
            </Link>
            <Link
              className="flex-1 font-semibold text-slate-700 hover:underline truncate"
              to={`/listing/${listing._id}`}
            >
              <p>{listing.name}</p>
            </Link>

            <div className="flex flex-col items-center">
              <button
                onClick={() => handleDeleteListing(listing._id)}
                className="text-red-700 uppercase"
              >
                Delete
              </button>
              <button className="text-green-700 uppercase">Edit</button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Profile;
