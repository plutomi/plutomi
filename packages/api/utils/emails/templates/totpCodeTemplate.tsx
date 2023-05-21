import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import React from "react";

export const TOTPCodeTemplate: React.FC = () => (
  <Html lang="en" dir="ltr">
    <Button href="https://example.com" style={{ color: "#61dafb" }}>
      Click me
    </Button>
  </Html>
);
