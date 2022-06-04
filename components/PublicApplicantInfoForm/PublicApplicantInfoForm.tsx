import { FormEvent, useState } from 'react';
import { Switch } from '@headlessui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CreateApplicant } from '../../adapters/Applicants';
import combineClassNames from '../../utils/combineClassNames';
import { CustomQuery } from '../../types/main';

export const PublicApplicantInfoForm = () => {
  const router = useRouter();
  const { orgId, openingId } = router.query as Pick<CustomQuery, 'openingId' | 'orgId'>;
  const [agreed, setAgreed] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [buttonText, setButtonText] = useState('Apply');
  const handleSubmit = async (e: FormEvent) => {
    setButtonText('Submitting...');
    e.preventDefault();
    if (!agreed) {
      alert(`You must agree to the privacy and cookie policy`);
      return;
    }

    try {
      const { data } = await CreateApplicant({
        orgId,
        openingId,
        firstName,
        lastName,
        email,
      });
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
    setButtonText('Apply');
  };
  return (
    <div className="bg-white py-8 px-4 overflow-hidden sm:px-6 lg:px-8 ">
      <div className="relative max-w-xl mx-auto">
        <svg
          className="absolute left-full transform translate-x-1/2"
          width={404}
          height={404}
          fill="none"
          viewBox="0 0 404 404"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="85737c0e-0916-41d7-917f-596dc7edfa27"
              x={0}
              y={0}
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <rect
                x={0}
                y={0}
                width={4}
                height={4}
                className="text-gray-200"
                fill="currentColor"
              />
            </pattern>
          </defs>
          <rect width={404} height={404} fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
        </svg>
        <svg
          className="absolute right-full bottom-0 transform -translate-x-1/2"
          width={404}
          height={404}
          fill="none"
          viewBox="0 0 404 404"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="85737c0e-0916-41d7-917f-596dc7edfa27"
              x={0}
              y={0}
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <rect
                x={0}
                y={0}
                width={4}
                height={4}
                className="text-gray-200"
                fill="currentColor"
              />
            </pattern>
          </defs>
          <rect width={404} height={404} fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)" />
        </svg>
        <div className="text-center">
          {/* <h2 className="text-2xl font-semibold tracking-tight text-dark">
            Apply for this opening
          </h2> */}
          <p className=" text-md leading-6 text-normal">TODO add captcha.</p>
        </div>
        <div className="mt-12">
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
          >
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-normal">
                First name
              </label>
              <input
                type="text"
                name="first-name"
                id="first-name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-normal">
                Last name
              </label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
              />
            </div>
            {/* <div className="sm:col-span-2">
              <label
                htmlFor="company"
                className="block text-sm font-medium text-normal"
              >
                Company
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id="company"
                  autoComplete="organization"
                  className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                />
              </div>
            </div> */}
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-normal">
                Email
              </label>
              <input
                id="email"
                name="email"
                placeholder="johnsmith@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
              />
            </div>
            {/* <div className="sm:col-span-2">
              <label
                htmlFor="phone-number"
                className="block text-sm font-medium text-normal"
              >
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <label htmlFor="country" className="sr-only">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    className="h-full py-0 pl-4 pr-8 border-transparent bg-transparent text-light focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option>US</option>
                    <option>CA</option>
                    <option>EU</option>
                  </select>
                </div>
                <input
                  type="text"
                  name="phone-number"
                  id="phone-number"
                  autoComplete="tel"
                  className="py-3 px-4 block w-full pl-20 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div> */}
            {/* <div className="sm:col-span-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-normal"
              >
                Message
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md"
                  defaultValue={""}
                />
              </div>
            </div> */}
            <div className="sm:col-span-2">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Switch
                    checked={agreed}
                    onChange={setAgreed}
                    className={combineClassNames(
                      agreed ? 'bg-blue-600' : 'bg-gray-200',
                      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    )}
                  >
                    <span className="sr-only">Agree to policies</span>
                    <span
                      aria-hidden="true"
                      className={combineClassNames(
                        agreed ? 'translate-x-5' : 'translate-x-0',
                        'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                      )}
                    />
                  </Switch>
                </div>
                <div className="ml-3">
                  {/* TODO add these links */}
                  <p className="text-base text-light">
                    By selecting this, you agree to the Plutomi Inc.{' '}
                    <Link href="##" passHref>
                      {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a
                        href="##"
                        className="font-medium text-normal underline hover:text-dark transition ease-in-out duration-200"
                      >
                        Privacy Policy
                      </a>
                    </Link>{' '}
                    and{' '}
                    <Link href="##" passHref>
                      {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a
                        href="#"
                        className="font-medium text-normal underline hover:text-dark transition ease-in-out duration-200"
                      >
                        Cookie Policy
                      </a>
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
