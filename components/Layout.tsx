export default function Layout({ header, main }) {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <header>
        <h1 className="text-5xl font-bold">{header}</h1>
      </header>
      <main>
        <div className=" py-8 ">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            {main}
          </div>
        </div>
      </main>
    </div>
  );
}
