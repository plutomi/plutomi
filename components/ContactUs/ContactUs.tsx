export const ContactUs = () => (
  <div className="bg-blue-gray-900">
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
      <div className="divide-y-2 divide-gray-200">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Get in touch</h2>
          <div className="mt-8 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:mt-0 lg:col-span-2">
            <div>
              <h3 className="text-xl leading-6 font-bold text-white">Support</h3>
              <dl className="mt-2 text-lg text-blue-gray-400">
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd>support@plutomi.com</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-xl leading-6 font-bold text-white">Are you a VC?</h3>
              <dl className="mt-2 text-lg text-blue-gray-400">
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd>ir@plutomi.com</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-xl leading-6 font-bold text-white">General Inquiries</h3>
              <dl className="mt-2 text-blue-gray-400 text-lg">
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd>contact@plutomi.com</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
