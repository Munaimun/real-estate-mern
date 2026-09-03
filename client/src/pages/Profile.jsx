import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";

import { storage } from "../firebase";
import {
  updateUserSuccess,
  updateUserStart,
  updateUserFailure,
  resetUserStatus,
} from "../redux/user/userSlice";

const uploadImage = (imageRef, file) =>
  new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(imageRef, file);
    const timeoutId = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error("Image upload timed out. Check Firebase Storage."));
    }, 30000);

    uploadTask.on(
      "state_changed",
      undefined,
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      () => {
        clearTimeout(timeoutId);
        resolve(uploadTask.snapshot.ref);
      },
    );
  });

const withTimeout = (promise, milliseconds) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Could not retrieve the uploaded image URL.")),
        milliseconds,
      ),
    ),
  ]);

const Profile = () => {
  // Get the current user from the Redux store.
  const { currentUser, loading } = useSelector((state) => state.user);
  const [formData, setFormData] = useState(() => ({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
    photo: currentUser?.photo || "",
  }));
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentUser?.photo || "");
  const [updateError, setUpdateError] = useState("");
  const [success, setSuccess] = useState("");

  const fileRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetUserStatus());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((previous) => ({ ...previous, [e.target.id]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUpdateError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUpdateError("Please select an image smaller than 5 MB.");
      return;
    }

    setUpdateError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setSuccess("");

    try {
      dispatch(updateUserStart()); // Start the update process and set loading to true.

      let photo = formData.photo;
      if (selectedFile) {
        const imageRef = ref(
          storage,
          `profile-images/${currentUser._id}-${Date.now()}-${selectedFile.name}`,
        );
        await uploadImage(imageRef, selectedFile);
        photo = await withTimeout(getDownloadURL(imageRef), 30000);
      }

      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        photo,
      };
      if (formData.password.trim()) updateData.password = formData.password;

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        const message = data.message || "Could not update profile";
        setUpdateError(message);
        dispatch(updateUserFailure(message));
        return;
      }

      dispatch(updateUserSuccess(data)); // Update the Redux store with the new user data.
      setFormData((previous) => ({
        ...previous,
        password: "",
        photo: data.photo || photo,
      }));
      setSelectedFile(null);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setUpdateError(err.message);
      dispatch(updateUserFailure(err.message));
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <img
          onClick={() => fileRef.current.click()} // When the user clicks the profile picture, trigger a click on the hidden file input to allow them to select a new profile picture.
          src={previewUrl}
          alt="Profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
        <input
          type="text"
          placeholder="username"
          value={formData.username}
          className="border p-3 rounded-lg"
          id="username"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          value={formData.email}
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          value={formData.password}
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "updating..." : "update"}
        </button>
      </form>

      {updateError && <p className="text-red-700 mt-4">{updateError}</p>}
      {success && <p className="text-green-700 mt-4">{success}</p>}

      <div className="flex justify-between">
        <span className="text-red-700 cursor-pointer">Delete Account</span>

        <span className="text-red-700 cursor-pointer">Sign out</span>
      </div>
    </div>
  );
};

export default Profile;
