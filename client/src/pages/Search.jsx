import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";

const Search = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Read the search values from the URL when the component first loads.
  const [sidebardata, setSidebarData] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);

    return {
      searchTerm: urlParams.get("searchTerm") || "",
      type: urlParams.get("type") || "all",
      parking: urlParams.get("parking") === "true",
      furnished: urlParams.get("furnished") === "true",
      offer: urlParams.get("offer") === "true",
      sort: urlParams.get("sort") || "createdAt",
      order: urlParams.get("order") || "desc",
    };
  });

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);

      try {
        const urlParams = new URLSearchParams(location.search);
        const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch listings");
        }

        setListings(data);
      } catch (error) {
        console.error(error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  // Handle changes to the search/filter inputs.
  const handleChange = (e) => {
    if (
      e.target.id === "all" ||
      e.target.id === "rent" ||
      e.target.id === "sale"
    ) {
      setSidebarData({
        ...sidebardata,
        type: e.target.id,
      });
    }

    if (e.target.id === "searchTerm") {
      setSidebarData({
        ...sidebardata,
        searchTerm: e.target.value,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setSidebarData({
        ...sidebardata,
        [e.target.id]: e.target.checked,
      });
    }

    if (e.target.id === "sort_order") {
      const [sort, order] = e.target.value.split("_");

      setSidebarData({
        ...sidebardata,
        sort,
        order,
      });
    }
  };

  // Handle form submission.
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create URL query parameters.
    const urlParams = new URLSearchParams();

    // Add the current search/filter values to the URL.
    urlParams.set("searchTerm", sidebardata.searchTerm);
    urlParams.set("type", sidebardata.type);
    urlParams.set("parking", sidebardata.parking);
    urlParams.set("furnished", sidebardata.furnished);
    urlParams.set("offer", sidebardata.offer);
    urlParams.set("sort", sidebardata.sort);
    urlParams.set("order", sidebardata.order);

    // Convert the parameters into a query string.
    const searchQuery = urlParams.toString();

    // Navigate to the search page with the filters.
    navigate(`/search?${searchQuery}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-5">
      {/* Left side = search/filter form */}
      <div className="p-5 border-slate-200 border-b-2 md:border-r-2 md:min-h-screen bg-slate-100">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Search input */}
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>

            <input
              value={sidebardata.searchTerm}
              onChange={handleChange}
              type="text"
              id="searchTerm"
              placeholder="search..."
              className="border rounded-lg w-full p-3 bg-white"
            />
          </div>

          {/* Listing type filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>

            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={sidebardata.type === "all"}
                type="checkbox"
                id="all"
                className="w-5"
              />
              <span>Rent & Sale</span>
            </div>

            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={sidebardata.type === "rent"}
                type="checkbox"
                id="rent"
                className="w-5"
              />
              <span>Rent</span>
            </div>

            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={sidebardata.type === "sale"}
                type="checkbox"
                id="sale"
                className="w-5"
              />
              <span>Sale</span>
            </div>

            {/* Offer filter */}
            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={sidebardata.offer}
                type="checkbox"
                id="offer"
                className="w-5"
              />
              <span>Offer</span>
            </div>
          </div>

          {/* Amenities filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Amenities:</label>

            {/* Parking */}
            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={sidebardata.parking}
                type="checkbox"
                id="parking"
                className="w-5"
              />
              <span>Parking</span>
            </div>

            {/* Furnished */}
            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={sidebardata.furnished}
                type="checkbox"
                id="furnished"
                className="w-5"
              />
              <span>Furnished</span>
            </div>
          </div>

          {/* Sorting options */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>

            <select
              onChange={handleChange}
              defaultValue="createdAt_desc"
              id="sort_order"
              className="border rounded-lg p-3"
            >
              <option value="regularPrice_desc">Price high to low</option>

              <option value="regularPrice_asc">Price low to high</option>

              <option value="createdAt_desc">Latest</option>

              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95"
          >
            Search
          </button>
        </form>
      </div>

      {/* Right side = search results */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold p-3 text-slate-700 sm:mt-2 mt-0">
          Listing Results:
        </h1>

        <div className="p-7 flex flex-wrap gap-4">
          {!loading && listings.length === 0 && (
            <p className="text-xl text-slate-700">No listings found.</p>
          )}
          {loading && (
            <p className="text-xl text-slate-700 text-center x-full">
              Loading...
            </p>
          )}

          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
