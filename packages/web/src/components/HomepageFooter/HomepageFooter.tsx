import { useClipboard } from "@mantine/hooks";
import { PlutomiEmails } from "@plutomi/shared";
import { toast } from "react-hot-toast";
import { Button } from "../Button";

export const HomepageFooter: React.FC = () => {
  const clipboard = useClipboard({ timeout: 500 });

  return (
    <footer className="bg-white rounded-lg shadow max-w-2xl w-full p-4">
      <div className="flex items-center justify-between">
        <p className="text-lg text-slate-900  font-bold ">Plutomi Inc.</p>

        <Button
          variant="secondary-text"
          onClick={() => {
            clipboard.copy(PlutomiEmails.JOSE);
            toast.success("Email copied!", {
              position: "bottom-center"
            });
          }}
        >
          {PlutomiEmails.JOSE}
        </Button>
      </div>
    </footer>
  );
};
