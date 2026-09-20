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
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-semibold text-slate-800">
        Update a Listing
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-2"
      >
        {/* Left side - listing information */}
        <div className="flex flex-col gap-5">
          {/* Listing name */}
          <label className="text-sm font-medium text-slate-700">
            Listing name
            <input
              name="name"
              type="text"
              placeholder="Name"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              maxLength="62"
              minLength="10"
              required
              value={formData.name || ""}
              onChange={handleChange}
            />
          </label>

          {/* Listing description */}
          <label className="text-sm font-medium text-slate-700">
            Description
            <textarea
              name="description"
              placeholder="Describe the property"
              className="mt-1 min-h-32 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
              value={formData.description || ""}
              onChange={handleChange}
            />
          </label>

          {/* Listing address */}
          <label className="text-sm font-medium text-slate-700">
            Address
            <input
              name="address"
              type="text"
              placeholder="Property address"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
              value={formData.address || ""}
              onChange={handleChange}
            />
          </label>

          {/* Listing type and options */}
          <fieldset className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-700">
              Property details
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  name="type"
                  value="sale"
                  type="radio"
                  checked={formData.type === "sale"}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 accent-slate-700"
                />{" "}
                Sell
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  name="type"
                  value="rent"
                  type="radio"
                  checked={formData.type === "rent"}
                  onChange={handleChange}
                  className="h-4 w-4 accent-slate-700"
                />{" "}
                Rent
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  name="parking"
                  type="checkbox"
                  checked={Boolean(formData.parking)}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-slate-700"
                />{" "}
                Parking Spot
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  name="furnished"
                  type="checkbox"
                  checked={Boolean(formData.furnished)}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-slate-700"
                />{" "}
                Furnished
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  name="offer"
                  type="checkbox"
                  checked={Boolean(formData.offer)}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-slate-700"
                />{" "}
                Offer
              </label>
            </div>
          </fieldset>

          {/* Bedrooms, bathrooms and prices */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="text-sm font-medium text-slate-700">
              Bedrooms
              <input
                name="bedrooms"
                type="number"
                min="1"
                max="10"
                placeholder="0"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={formData.bedrooms || ""}
                onChange={handleChange}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Bathrooms
              <input
                name="bathrooms"
                type="number"
                min="1"
                max="10"
                placeholder="0"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={formData.bathrooms || ""}
                onChange={handleChange}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Regular price
              <input
                name="regularPrice"
                type="number"
                min="1"
                placeholder="Regular price"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={formData.regularPrice || ""}
                onChange={handleChange}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Discount price
              <input
                name="discountPrice"
                type="number"
                min="1"
                placeholder="Discount price"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={formData.discountPrice || ""}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        {/* Right side - images */}
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Property images
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select new images to replace the existing ones. Maximum 6 images.
            </p>
          </div>

          {/* Select new images */}
          <input
            onChange={handleFileChange}
            type="file"
            accept="image/*"
            multiple
            className="w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-slate-700 file:px-4 file:py-3 file:font-medium file:text-white hover:file:bg-slate-800"
          />

          {/* Show newly selected image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imagePreviews.map((preview, index) => (
                <div key={`${preview.name}-${index}`} className="relative">
                  <img
                    src={preview.url}
                    alt={`Listing preview ${index + 1}`}
                    className="h-32 w-full rounded-lg border border-slate-200 object-cover shadow-sm"
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={`/api/listing/${formData._id}/image/${index}`}
                    alt={`Existing listing image ${index + 1}`}
                    className="h-32 w-full rounded-lg border border-slate-200 object-cover shadow-sm"
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
            className="mt-auto w-full rounded-lg bg-slate-700 p-3 font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
