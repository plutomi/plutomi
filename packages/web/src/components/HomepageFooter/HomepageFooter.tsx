import EmailButton from "./EmailButton";

export const HomepageFooter: React.FC = () => (
  <footer className="bg-white rounded-lg shadow max-w-2xl  p-4 flex w-full items-center justify-between">
    <p className="text-lg text-slate-700 font-bold ">Plutomi Inc.</p>
    <EmailButton />
  </footer>
);
