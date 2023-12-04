
import EmailButton from "./EmailButton";

export const HomepageFooter: React.FC = () => (
  <footer className="bg-white rounded-lg shadow max-w-2xl w-full p-4">
    <div className="flex items-center justify-between">
      <p className="text-lg text-slate-900  font-bold ">Plutomi Inc.</p>
      <EmailButton />
    </div>
  </footer>
);
