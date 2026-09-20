import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaSearch } from "react-icons/fa";

const defaultAvatar = "/default-avatar.svg";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle the search form submission.
  const handleSubmit = (e) => {
    e.preventDefault();

    const searchTerm = e.currentTarget.elements.searchTerm.value;

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 p-3 sm:gap-4">
        {/* Logo */}
        <Link to="/">
          <h1 className="flex flex-wrap text-sm font-bold sm:text-xl">
            <span className="text-slate-500">Real</span>
            <span className="text-slate-700">Estate</span>
          </h1>
        </Link>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="flex shrink items-center rounded-lg bg-slate-100 p-1"
        >
          <input
            key={location.pathname}
            type="text"
            name="searchTerm"
            placeholder="Search..."
            defaultValue={
              location.pathname === "/search"
                ? new URLSearchParams(location.search).get("searchTerm") || ""
                : ""
            }
            className="w-20 bg-transparent text-sm focus:outline-none sm:w-64"
          />

          <button type="submit">
            <FaSearch className="text-slate-600" />
          </button>
        </form>

        {/* Header navigation */}
        <ul className="flex shrink-0 cursor-pointer items-center gap-2 text-xs sm:gap-4 sm:text-sm">
          {/* Home link */}
          <Link to="/">
            <li className="text-slate-700 hover:underline">Home</li>
          </Link>

          {/* About link */}
          <Link to="/about">
            <li className="text-slate-700 hover:underline">About</li>
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
