import { Link } from "react-router-dom";
import { FaHome, FaKey, FaSearch, FaShieldAlt } from "react-icons/fa";
import heroMark from "../assets/images.jpg";

const About = () => {
  return (
    <main className="overflow-hidden bg-white text-slate-700">
      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="relative z-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
            About RealEstate
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-800 sm:text-6xl">
            A clearer way to find your next place.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            RealEstate brings homes, apartments, and opportunities into one
            straightforward space. Search with confidence, compare what matters,
            and move closer to a place that feels right.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FaSearch />
              Explore listings
            </Link>
            <Link
              to="/create-listing"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
            >
              <FaHome />
              List a property
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-72 items-center justify-center rounded-2xl bg-slate-100 p-10 sm:min-h-96">
          {/* <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-blue-100" />
          <div className="absolute bottom-8 left-8 h-16 w-16 rounded-full bg-slate-200" /> */}
          <img
            src={heroMark}
            alt="RealEstate brand mark"
            className="relative z-10 w-56 rounded-md max-w-full object-contain drop-shadow-xl sm:w-72"
          />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
              Built around your search
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-800 sm:text-4xl">
              Less noise. Better decisions.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <FaSearch className="text-2xl text-blue-800" />
              <h3 className="mt-5 text-xl font-semibold text-slate-800">
                Search with purpose
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Filter by location, type, amenities, and price so the right
                listings rise to the top quickly.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <FaKey className="text-2xl text-blue-800" />
              <h3 className="mt-5 text-xl font-semibold text-slate-800">
                Find a better fit
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Browse clear property details and compare the features that
                shape everyday living.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <FaShieldAlt className="text-2xl text-blue-800" />
              <h3 className="mt-5 text-xl font-semibold text-slate-800">
                Keep moving forward
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Save time by keeping discovery, listing details, and your next
                step together in one simple experience.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-14 sm:px-8 sm:py-20 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
            Your next chapter starts here
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            Ready to look around?
          </h2>
        </div>
        <Link
          to="/search"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Browse all listings
        </Link>
      </section>
    </main>
  );
};

export default About;
