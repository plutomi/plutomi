import { Button } from "../Button";
import { useClipboard } from "@mantine/hooks";
import { toast } from "react-hot-toast";

const email = "jose@plutomi.com";

export default function EmailButton() {
  const clipboard = useClipboard();

  return (
    <>
      <Button
        variant="secondary-text"
        onClick={() => {
          clipboard.copy(email);
          toast.success("Email copied!", {
            position: "bottom-center"
          });
        }}
      >
        {email}
      </Button>
    </>
  );
}
