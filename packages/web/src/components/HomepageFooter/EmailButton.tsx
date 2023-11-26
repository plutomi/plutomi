"use client";

import { Button } from "../Button";
import { toast } from "react-hot-toast";
import { useClipboard } from "@mantine/hooks";

const email = "jose@plutomi.com";

export default function EmailButton() {
  const clipboard = useClipboard();

  return (
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
  );
}
