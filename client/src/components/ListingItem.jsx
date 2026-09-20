import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";

const ListingItem = ({ listing }) => {
  const price = listing.offer ? listing.discountPrice : listing.regularPrice;
  const savings = Number(listing.regularPrice) - Number(listing.discountPrice);

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-lg sm:w-82.5">
      <Link to={`/listing/${listing._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={listing.images?.[0]}
            alt={listing.name}
            className="h-80 w-full object-cover transition-transform duration-200 ease-in-out hover:scale-105 sm:h-55"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-white">
              {listing.type === "rent" ? "For Rent" : "For Sale"}
            </span>
            {listing.offer && (
              <span className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                Offer
              </span>
            )}
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="text-lg font-semibold text-slate-700 truncate">
            {listing.name}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600 truncate w-full">
              {listing.address}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
          <p className="text-lg font-semibold text-slate-700">
            ${Number(price).toLocaleString("en-US")}{" "}
            {listing.type === "rent" && "/ month"}
          </p>
          {listing.offer && savings > 0 && (
            <p className="text-xs font-semibold text-emerald-700">
              Save ${savings.toLocaleString("en-US")}
            </p>
          )}
          <div className="text-slate-700 flex gap-4">
            <div className="font-bold text-xs">
              {listing.bedrooms > 1 ? `${listing.bedrooms} beds` : "bed"}
            </div>
            <div className="font-bold text-xs">
              {listing.bathrooms > 1 ? `${listing.bathrooms} baths` : "bath"}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ListingItem;
