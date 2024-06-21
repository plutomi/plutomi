import EmailButton from "./EmailButton";

export const HomepageFooter: React.FC = () => (
  <footer className="bg-white rounded-[0.75rem] drop-shadow max-w-2xl  py-2 px-3 space-x-4 flex w-full items-center justify-between">
    <p className=" text-slate-700 font-bold ">Plutomi Inc.</p>
    <EmailButton />
  </footer>
);
