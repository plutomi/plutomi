interface LayoutProps {
  header: string;
  main: string;
  footer: string;
}

export default function Layout({ header, main, footer }: LayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 my-12">
      {header && <header>{header}</header>}
      {main && (
        <main>
          <div className="py-8">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex justify-center items-center">
              {main}
            </div>
          </div>
        </main>
      )}

      {footer && <footer>{footer}</footer>}
    </div>
  );
}
