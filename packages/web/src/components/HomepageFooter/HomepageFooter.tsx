import EmailButton from "./EmailButton";

export const HomepageFooter: React.FC = () => (
  <footer className="bg-white rounded-[0.75rem] shadow max-w-2xl  p-2 flex w-full items-center justify-between">
    <p className="text-lg text-slate-700 font-bold ">Plutomi Inc.</p>
    <EmailButton />
  </footer>
);
