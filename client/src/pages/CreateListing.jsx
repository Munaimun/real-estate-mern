import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

const CreateListing = () => {
  // Get the currently logged-in user from Redux.
  const { currentUser } = useSelector((state) => state.user);

  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // If there is no logged-in user, send them to the sign-in page.
  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
    }
  }, [currentUser, navigate]);

  // Create image previews for the selected files.
  const imagePreviews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  // Clean up the temporary image URLs when they are no longer needed.
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Make sure the user selects between 1 and 6 images.
    if (!files.length || files.length > 6) {
      setError("Choose between 1 and 6 images.");
      return;
    }

    // Get all text/checkbox/radio values from the form.
    const formData = new FormData(event.currentTarget);
    files.forEach((file) => formData.append("images", file));

    try {
      setLoading(true);
      const response = await fetch("/api/listing/create", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Could not create listing");
      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
          />
          <input
            name="address"
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <label>
              <input name="type" value="sale" type="radio" required /> Sell
            </label>
            <label>
              <input name="type" value="rent" type="radio" /> Rent
            </label>
            <label>
              <input name="parking" value="true" type="checkbox" /> Parking Spot
            </label>
            <label>
              <input name="furnished" value="true" type="checkbox" /> Furnished
            </label>
            <label>
              <input name="offer" value="true" type="checkbox" /> Offer
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              name="bedrooms"
              type="number"
              min="1"
              max="10"
              placeholder="Beds"
              required
              className="w-24 border rounded-lg p-2"
            />
            <input
              name="bathrooms"
              type="number"
              min="1"
              max="10"
              placeholder="Baths"
              required
              className="w-24 border rounded-lg p-2"
            />
            <input
              name="regularPrice"
              type="number"
              min="1"
              placeholder="Regular price"
              required
              className="border rounded-lg p-2"
            />
            <input
              name="discountPrice"
              type="number"
              min="1"
              placeholder="Discount price"
              required
              className="border rounded-lg p-2"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:{" "}
            <span className="font-normal text-gray-700">
              the first image is the cover (max 6)
            </span>
          </p>
          <input
            onChange={(event) => setFiles([...event.target.files])}
            type="file"
            accept="image/*"
            multiple
            className="p-3 border border-gray-300 rounded w-full"
            required
          />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={`${preview.name}-${index}`} className="relative">
                  <img
                    src={preview.url}
                    alt={`Listing preview ${index + 1}`}
                    className="h-28 w-full rounded-lg object-cover border"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-slate-800 px-2 py-1 text-xs text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            disabled={loading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
          {error && <p className="text-red-700">{error}</p>}
        </div>
      </form>
    </main>
  );
};

export default CreateListing;
