"use client";

import { Button } from "../Button";
import { useClipboard } from "@mantine/hooks";
import { Toaster, toast } from "react-hot-toast";

const email = "jose@plutomi.com";

export default function EmailButton() {
  const clipboard = useClipboard();

  return (
    <>
      <Toaster />
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
