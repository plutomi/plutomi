/* This example requires Tailwind CSS v2.0+ */
import NewPricing from "../components/Pricing";
import Contact from "../components/ContactUs";
import FeatureBox from "../components/featureBox";
import Navbar from "../components/navbar";
export default function Main() {
  return (
    <div className="">
      <main className="bg-gradient-to-b from-blue-gray-50 to-white">
        <Navbar />

        <div className="mx-auto max-w-7xl w-full py-6  text-center lg:py-12  lg:text-left">
          <div className="px-4 w-full  flex flex-col justify-center items-center">
            <span className="px-3 py-1 text-blue-gray-50 text-sm font-semibold leading-4 uppercase tracking-wide bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full">
              Coming soon!
            </span>
            <h1 className=" text-4xl xl:inline text-blue-gray-900 tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              Applicant management
            </h1>
            <h1 className=" p-1 text-4xl xl:inline text-blue-gray-900 text-emerald tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              at any scale
            </h1>
            <p className="mt-3 mx-auto text-xl text-center text-blue-gray-700 sm:text-2xl md:mt-5">
              Plutomi automates your entire application process with streamlined
              workflows
            </p>
          </div>
        </div>
        <section className="py-14">
          <FeatureBox />
        </section>
      </main>
      <section className="relative ">
        <div className="custom-shape-divider-top-1630498878">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      <section id="pricing">
        <NewPricing />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </div>
  );
}
