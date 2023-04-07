interface PageHeaderProps {
  headerText: string;
}

export const NewPageHeader = ({ headerText }: PageHeaderProps) => (
  <div className="md:flex md:items-center md:justify-between ">
    <div className=" min-w-0 ">
      <h2 className="text-2xl font-bold leading-7 text-dark sm:text-4xl sm:truncate">
        {headerText}
      </h2>
    </div>
  </div>
);
