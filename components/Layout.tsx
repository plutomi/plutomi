export default function Layout({ headerText, main, footer }) {
  return (
    <div className="max-w-7xl mx-auto px-4 my-12">
      <header>
        <h1 className="text-5xl font-bold">{headerText}</h1>
      </header>
      {main ? (
        <main >
          {" "}
          <div className="py-8">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex justify-center items-center">
              {main}
            </div>
          </div>
        </main>
      ) : null}

      {footer ? <footer>{footer}</footer> : null}
    </div>
  );
}
