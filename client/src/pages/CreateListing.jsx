import { useState } from "react";

import { getStorage, ref } from "firebase/storage";

import { app } from "../firebase";

const CreateListing = () => {
  const [files, setFiles] = useState([]);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length < 7) {
      const promises = [];

      for (let i = 0; i < files.length; i++)
        promises.push(storeImage(files[i]));
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
    });
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Create a Listing
      </h1>

      <form className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
          />
          {/* check box's */}
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>{" "}
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="w-20 shrink-0 border border-gray-300 rounded-lg text-center p-1 bg-white"
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="baths"
                min="1"
                max="10"
                required
                className="w-20 shrink-0 border border-gray-300 rounded-lg text-center p-1 bg-white"
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regular-price"
                min="1"
                max="10000000"
                required
                className="border border-gray-300 rounded-lg text-center p-1 bg-white"
              />
              <div className="">
                <p>Regular Price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discount-price"
                min="1"
                max="10000000"
                required
                className="border border-gray-300 rounded-lg text-center p-1 bg-white"
              />
              <div className="">
                <p>Discount Price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
          </div>
        </div>

        {/* image and submit button */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-700 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              type="file"
              id="images"
              accept="image/*"
              multiple
              className="p-3 border border-gray-300 rounded w-full"
            />
            <button
              type="button"
              onSubmit={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-85"
            >
              Upload
            </button>
          </div>
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateListing;
