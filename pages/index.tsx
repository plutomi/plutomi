import MaintenanceList from "../components/maintenance";
export default function Maintenance({ data }) {
  return (
    <>
      <div className="bg-white min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8 mt-30">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  Hello there!
                </h1>
                <p className="mt-1  text-2xl text-gray-500">
                  We&apos;re currently down for maintenance as we migrate some
                  of our backend infastructure. You can even contribute on
                  Github!
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
      <MaintenanceList commits={data} />
    </>
  );
}

export async function getStaticProps(context) {
  const res = await fetch(
    `https://api.github.com/repos/plutomi/plutomi/commits?sha=add-cdk&per_page=5`
  );
  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { data }, // will be passed to the page component as props
  };
}
