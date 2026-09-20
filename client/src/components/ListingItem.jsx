import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";

const ListingItem = ({ listing }) => {
  return (
    <div className="shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg gap-4 w-full sm:w-82.5">
      <Link to={`/listing/${listing._id}`}>
        <img
          src={listing.images?.[0]}
          alt={listing.name}
          className="w-full h-80 sm:h-55 object-cover hover:scale-105 transition-transform duration-200 ease-in-out"
        />
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
          <p className="text-slate-500 font-semibold">
            ${" "}
            {listing.offer
              ? listing.discountPrice.toLocaleString("en-US")
              : listing.regularPrice.toLocaleString("en-US")}{" "}
            {listing.type === "rent" && "/ month"}
          </p>
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
