import "@mantine/core/styles.css";

import { Inter } from "next/font/google";
import {
  MantineProvider,
  ColorSchemeScript,
  AppShell,
  createTheme,
  MantineColorsTuple,
  rem
} from "@mantine/core";
import { HeaderMenu } from "@/components/HeaderMenu/HeaderMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Plutomi",
  description: "Applicant management at any scale"
};

const myColor: MantineColorsTuple = [
  "#eef3ff",
  "#dbe4f5",
  "#b7c6e3",
  "#91a7d2",
  "#718cc4",
  "#5c7bbb",
  "#5073b8",
  "#4161a2",
  "#365692",
  "#294a83"
];

const theme = createTheme({
  colors: {
    myColor
  },
  fontFamily: "Inter, sans-serif",

  headings: {
    sizes: {
      h1: { fontSize: rem(60), lineHeight: "1.1" },
      h2: { fontSize: rem(54), lineHeight: "1.05" },
      h3: { fontSize: rem(48), lineHeight: "1.00" },
      h4: { fontSize: rem(36), lineHeight: "0.95" },
      h5: { fontSize: rem(24), lineHeight: "0.90" },
      h6: { fontSize: rem(18), lineHeight: "0.85" }
    }
  },
  fontSizes: {
    xs: rem(16),
    sm: rem(20),
    md: rem(24),
    lg: rem(28),
    xl: rem(32)
  }
});
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <ColorSchemeScript />
      </head>
      <html lang="en">
        <body>
          <MantineProvider theme={theme}>{children}</MantineProvider>
        </body>
      </html>
    </>
  );
}
