import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";

const defaultAvatar = "/default-avatar.svg";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  // Get the search term from the current URL when the component first loads.
  const [searchTerm, setSearchTerm] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);

    return urlParams.get("searchTerm") || "";
  });

  // Handle the search form submission.
  const handleSubmit = (e) => {
    e.preventDefault();

    // Get the current query parameters from the URL.
    const urlParams = new URLSearchParams(location.search);

    // Add or update the searchTerm parameter.
    urlParams.set("searchTerm", searchTerm);

    // Convert the query parameters into a URL string.
    const searchQuery = urlParams.toString();

    // Navigate to the search page.
    navigate(`/search?${searchQuery}`);
  };

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        {/* Logo */}
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Real</span>
            <span className="text-slate-700">Estate</span>
          </h1>
        </Link>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 p-1 rounded-lg flex items-center"
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none w-24 sm:w-64"
          />

          <button type="submit">
            <FaSearch className="text-slate-600" />
          </button>
        </form>

        {/* Header navigation */}
        <ul className="flex gap-4 cursor-pointer">
          {/* Home link */}
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              Home
            </li>
          </Link>

          {/* About link */}
          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              About
            </li>
          </Link>

          {/* Profile / Sign in link */}
          <Link to="/profile">
            {currentUser ? (
              <img
                src={currentUser.photo || currentUser.image || defaultAvatar}
                alt="Profile"
                onError={(event) => {
                  // If the user's image cannot load,
                  // show the default avatar instead.
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = defaultAvatar;
                }}
                className="rounded-full h-7 w-7 object-cover"
              />
            ) : (
              <li className="text-slate-700 hover:underline">Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default Header;
