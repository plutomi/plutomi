export default function PageHeader({ headerText }) {
  return (
    <div className="md:flex md:items-center md:justify-between border">
      <div className=" min-w-0 ">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-4xl sm:truncate">
          {headerText}
        </h2>
      </div>
    </div>
  );
}
