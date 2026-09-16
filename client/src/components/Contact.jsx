import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

const Contact = ({ listing }) => {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandlord(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  return (
    <>
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landlord.username}</span>{" "}
            for <span className="font-semibold">{listing.name}</span>
          </p>
          <textarea
            name="message"
            id="message"
            row="2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="button"
            onClick={() => {
              window.location.href = `mailto:${landlord.email}?subject=${encodeURIComponent(
                `Regarding ${listing.name}`,
              )}&body=${encodeURIComponent(message)}`;
            }}
            className="bg-slate-700 text-white text-center p-2 uppercase rounded-lg hover:opacity-95"
          >
            Send Message
          </button>
        </div>
      )}
    </>
  );
};

export default Contact;
