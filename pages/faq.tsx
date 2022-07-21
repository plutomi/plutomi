import { AlreadyLoggedIn } from '../components/AlreadyLoggedIn';
import { CustomLink } from '../components/CustomLink';
import { LoginHomepage } from '../components/LoginHomepage';
import { DOMAIN_NAME } from '../Config';
import { useSelf } from '../SWR/useSelf';

const faqs = [
  {
    question: 'What does *active* development mean?',
    answer: (
      <p>
        It means that this project is NOT production ready and can / will change at{' '}
        <strong>any</strong> time. You WILL lose your data :)
      </p>
    ),
  },
  {
    question: 'Can I still use the site?',
    answer:
      'Sure! Feel free to play around with it in the meantime but do note: *YOU WILL LOSE YOUR DATA!*',
  },
  {
    question: 'How do I give feedback / submit feature requests?',
    answer: (
      <p>
        <CustomLink url="https://github.com/plutomi/plutomi/issues" text="Create an issue" /> on
        GitHub or send us an email at contact@plutomi.com
      </p>
    ),
  },
  {
    question: 'Do you accept pull requests?',
    answer: (
      <p>
        Yes! Feel free to make a PR into the <strong>main</strong> branch on{' '}
        <CustomLink url="https://github.com/plutomi/plutomi" text="GitHub" />
      </p>
    ),
  },
  {
    question: 'What is the license for the code?',
    answer: (
      <p>
        The project is licensed under the{' '}
        <CustomLink
          url="https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)"
          text="Apache 2.0 license"
        />
      </p>
    ),
  },
];

export default function FAQ() {
  const { user, isUserLoading, isUserError } = useSelf();

  return (
    <div className="bg-white mx-auto text-left  flex justify-center">
      <div className="max-w-7xl  mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8  mt-8">
        <div className="lg:grid  lg:grid-cols-4 px-auto    place-content-center">
          <div className=" text-center lg:col-span-2 lg:text-left flex flex-col items-center justify-center">
            <h2 className="text-4xl font-extrabold text-dark ">Frequently Asked Questions</h2>
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
                  <dt className="text-xl leading-6text-dark font-bold">{faq.question}</dt>
                  <dd className="mt-2 text-lg text-normal ">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div>
          <div className="mt-32">
            {!user || isUserError ? (
              <LoginHomepage
                callbackUrl={`${DOMAIN_NAME}/dashboard`} // TODO fallback url is already set im pretty sure
              />
            ) : (
              <AlreadyLoggedIn />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
