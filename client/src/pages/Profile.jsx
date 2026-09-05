import { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { storage } from "../firebase";
import {
  updateUserSuccess,
  updateUserStart,
  updateUserFailure,
  resetUserStatus,
} from "../redux/user/userSlice";

// Default image shown when the user has no profile picture.
const defaultAvatar = "/default-avatar.svg";

// Upload an image to Firebase Storage.
const uploadImage = (imageRef, file) =>
  new Promise((resolve, reject) => {
    // Start uploading the selected file to Firebase.
    const uploadTask = uploadBytesResumable(imageRef, file);

    // Stop the upload if it takes longer than 30 seconds.
    const timeoutId = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error("Image upload timed out. Check Firebase Storage."));
    }, 30000);

    // Listen to the upload status.
    uploadTask.on(
      "state_changed",

      // We are not using upload progress here.
      undefined,

      // If the upload fails, clear the timer and return the error.
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },

      // When the upload finishes successfully.
      () => {
        clearTimeout(timeoutId);

        // Return the Firebase storage reference.
        resolve(uploadTask.snapshot.ref);
      },
    );
  });

// Wait for a Promise, but stop waiting if it takes too long.
const withTimeout = (promise, milliseconds) =>
  Promise.race([
    promise,

    // Reject the Promise if the given time has passed.
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Could not retrieve the uploaded image URL.")),
        milliseconds,
      ),
    ),
  ]);

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

      // By default, keep the user's current profile photo.
      let photo = formData.photo;

      // If the user selected a new image, upload it to Firebase.
      if (selectedFile) {
        // Create a unique Firebase Storage path for the image.
        const imageRef = ref(
          storage,
          `profile-images/${currentUser._id}-${Date.now()}-${selectedFile.name}`,
        );

        // Upload the selected image to Firebase.
        await uploadImage(imageRef, selectedFile);

        // Get the public/download URL of the uploaded image.
        photo = await withTimeout(getDownloadURL(imageRef), 30000);
      }

      // Create the data that will be sent to the backend.
      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        photo,
      };

      // Only send a password if the user entered a new one.
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      // Send the updated user information to the backend.
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // Send cookies such as the JWT access token.
        credentials: "include",

        // Convert the JavaScript object into JSON.
        body: JSON.stringify(updateData),
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
        photo: data.photo || photo,
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
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
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
      </form>

      {/* Show error message if there is an error. */}
      {updateError && <p className="text-red-700 mt-4">{updateError}</p>}

      {/* Show success message after a successful update. */}
      {success && <p className="text-green-700 mt-4">{success}</p>}

      <div className="flex justify-between">
        {/* Delete account option */}
        <span className="text-red-700 cursor-pointer">Delete Account</span>

        {/* Sign out option */}
        <span className="text-red-700 cursor-pointer">Sign out</span>
      </div>
    </div>
  );
};

export default Profile;
