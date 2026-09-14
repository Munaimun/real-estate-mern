import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const UpdateListing = () => {
  // Get the currently logged-in user from Redux.
  const { currentUser } = useSelector((state) => state.user);

  // Store the existing listing data and the user's changes.
  const [formData, setFormData] = useState({});

  // Store newly selected image files.
  const [files, setFiles] = useState([]);

  // Store error messages.
  const [error, setError] = useState("");

  // Store loading state while fetching/updating the listing.
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Get the listingId from the URL.
  // Example: /update-listing/123
  // params.listingId will be "123".
  const params = useParams();

  // Fetch the existing listing when the page loads.
  useEffect(() => {
    const fetchListing = async () => {
      try {
        // Get the listing ID from the URL.
        const listingId = params.listingId;

        // Request the existing listing from the backend.
        const res = await fetch(`/api/listing/get/${listingId}`);

        // Convert the response into a JavaScript object.
        const data = await res.json();

        // If the request failed, show the error message.
        if (!res.ok) {
          setError(data.message || "Could not fetch listing");
          return;
        }

        // Save the existing listing data.
        // This will fill the form with the current values.
        setFormData(data);
      } catch (err) {
        // Handle network or other errors.
        setError(err.message);
      }
    };

    fetchListing();
  }, [params.listingId]);

  // If there is no logged-in user, send them to the sign-in page.
  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
    }
  }, [currentUser, navigate]);

  // Create temporary preview URLs for newly selected images.
  const imagePreviews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  // Clean up temporary image URLs when they are no longer needed.
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [imagePreviews]);

  // Handle changes to text, number, checkbox, and radio inputs.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Checkboxes give us true/false through "checked".
    // Other inputs give us their value.
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle selecting new images.
  const handleFileChange = (event) => {
    const selectedFiles = [...event.target.files];

    // Make sure the user does not select more than 6 images.
    if (selectedFiles.length > 6) {
      setError("Choose a maximum of 6 images.");
      return;
    }

    setError("");

    // Save the selected files.
    setFiles(selectedFiles);
  };

  // Submit the updated listing.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

      // Get all form values.
      const data = new FormData();

      // Add the updated listing fields to FormData.
      data.append("name", formData.name || "");
      data.append("description", formData.description || "");
      data.append("address", formData.address || "");
      data.append("type", formData.type || "");

      data.append("bedrooms", formData.bedrooms || "");
      data.append("bathrooms", formData.bathrooms || "");
      data.append("regularPrice", formData.regularPrice || "");
      data.append("discountPrice", formData.discountPrice || "");

      // Convert boolean values to strings because FormData sends strings.
      data.append("furnished", String(formData.furnished || false));
      data.append("parking", String(formData.parking || false));
      data.append("offer", String(formData.offer || false));

      // Add newly selected images.
      // If no new images were selected, the backend will keep the old images.
      files.forEach((file) => {
        data.append("images", file);
      });

      // Send the updated listing to the backend.
      const response = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        credentials: "include",
        body: data,
      });

      // Convert the server response into JSON.
      const result = await response.json();

      // Check if the update failed.
      if (!response.ok) {
        throw new Error(result.message || "Could not update listing");
      }

      // Update was successful.
      navigate(`/listing/${params.listingId}`);
    } catch (err) {
      // Show the error to the user.
      setError(err.message);
    } finally {
      // Stop the loading state.
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Update a Listing
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-6">
        {/* Left side - listing information */}
        <div className="flex flex-col gap-2 flex-1">
          {/* Listing name */}
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            maxLength="62"
            minLength="10"
            required
            value={formData.name || ""}
            onChange={handleChange}
          />

          {/* Listing description */}
          <textarea
            name="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
            value={formData.description || ""}
            onChange={handleChange}
          />

          {/* Listing address */}
          <input
            name="address"
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            required
            value={formData.address || ""}
            onChange={handleChange}
          />

          {/* Listing type and options */}
          <div className="flex gap-6 flex-wrap">
            <label>
              <input
                name="type"
                value="sale"
                type="radio"
                checked={formData.type === "sale"}
                onChange={handleChange}
                required
              />{" "}
              Sell
            </label>

            <label>
              <input
                name="type"
                value="rent"
                type="radio"
                checked={formData.type === "rent"}
                onChange={handleChange}
              />{" "}
              Rent
            </label>

            <label>
              <input
                name="parking"
                type="checkbox"
                checked={Boolean(formData.parking)}
                onChange={handleChange}
              />{" "}
              Parking Spot
            </label>

            <label>
              <input
                name="furnished"
                type="checkbox"
                checked={Boolean(formData.furnished)}
                onChange={handleChange}
              />{" "}
              Furnished
            </label>

            <label>
              <input
                name="offer"
                type="checkbox"
                checked={Boolean(formData.offer)}
                onChange={handleChange}
              />{" "}
              Offer
            </label>
          </div>

          {/* Bedrooms, bathrooms and prices */}
          <div className="flex flex-wrap gap-3">
            <input
              name="bedrooms"
              type="number"
              min="1"
              max="10"
              placeholder="Beds"
              required
              className="w-24 border rounded-lg p-2"
              value={formData.bedrooms || ""}
              onChange={handleChange}
            />

            <input
              name="bathrooms"
              type="number"
              min="1"
              max="10"
              placeholder="Baths"
              required
              className="w-24 border rounded-lg p-2"
              value={formData.bathrooms || ""}
              onChange={handleChange}
            />

            <input
              name="regularPrice"
              type="number"
              min="1"
              placeholder="Regular price"
              required
              className="border rounded-lg p-2"
              value={formData.regularPrice || ""}
              onChange={handleChange}
            />

            <input
              name="discountPrice"
              type="number"
              min="1"
              placeholder="Discount price"
              required
              className="border rounded-lg p-2"
              value={formData.discountPrice || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Right side - images */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:{" "}
            <span className="font-normal text-gray-700">
              select new images to replace the old ones (max 6)
            </span>
          </p>

          {/* Select new images */}
          <input
            onChange={handleFileChange}
            type="file"
            accept="image/*"
            multiple
            className="p-3 border border-gray-300 rounded w-full"
          />

          {/* Show newly selected image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={`${preview.name}-${index}`} className="relative">
                  <img
                    src={preview.url}
                    alt={`Listing preview ${index + 1}`}
                    className="h-28 w-full rounded-lg object-cover border"
                  />

                  {/* The first image becomes the cover image. */}
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-slate-800 px-2 py-1 text-xs text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Show existing images when no new images are selected */}
          {!imagePreviews.length && formData.images?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={`/api/listing/${formData._id}/image/${index}`}
                    alt={`Existing listing image ${index + 1}`}
                    className="h-28 w-full rounded-lg object-cover border"
                  />

                  {/* The first existing image is the cover image. */}
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-slate-800 px-2 py-1 text-xs text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Update button */}
          <button
            disabled={loading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>

          {/* Display error message */}
          {error && <p className="text-red-700">{error}</p>}
        </div>
      </form>
    </main>
  );
};

export default UpdateListing;
