import CustomLink from "../components/CustomLink";
import Link from "../components/CustomLink";
const faqs = [
  {
    question: "If I manually update an applicant, will they count as active?",
    answer: (
      <p>
        No, an applicant only becomes active when they make an update to their
        own application.
      </p>
    ),
  },
  {
    question: "How many users / applicants / openings can I have?",
    answer: "As many as you want!",
  },
  {
    question: "What is the license for the code?",
    answer: (
      <p>
        The code is licensed under the{" "}
        <CustomLink
          url={
            "https://tldrlegal.com/license/gnu-affero-general-public-license-v3-(agpl-3.0)"
          }
          text={"AGPLv3 license"}
        />
        .
      </p>
    ),
  },
];

export default function FAQ() {
  return (
    <div className="bg-white mx-auto text-left  flex justify-center">
      <div className="max-w-7xl  mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8  mt-8">
        <div className="lg:grid  lg:grid-cols-4 px-auto    place-content-center">
          <div className=" text-center lg:col-span-2 lg:text-left flex flex-col items-center justify-center">
            <h2 className="text-4xl font-extrabold text-dark ">
              Frequently Asked Questions
            </h2>
            {/* <p className="mt-4 text-lg text-normal">
              Can’t find the answer you’re looking for? Please{" "}
              <CustomLink
                url={"mailto:contact@plutomi.com?subject=Question"}
                text={"contact us"}
              />
              !
            </p> */}
          </div>

          <div className="px-auto mx-auto mt-12 lg:mt-0 lg:col-span-2  text-end">
            <dl className=" space-y-12 flex flex-col  ">
              {faqs.map((faq) => (
                <div key={faq.question} className=" my-auto">
                  <dt className="text-xl leading-6 font-medium text-dark">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-lg text-normal ">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
