export default function Layout({ headerText, main, footer }) {
  return (
    <div className="max-w-7xl mx-auto px-4 border">
      <header>
        <h1 className="text-5xl font-bold">{headerText}</h1>
      </header>
      <main>
        <div className="py-8">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            {main}
          </div>
        </div>
      </main>
      {footer ? <footer>{footer}</footer> : null}
    </div>
  );
}
