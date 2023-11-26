import glob from "fast-glob";
import { Providers } from "./providers";
import { Layout } from "@/docsComponents/Layout";

import "@/styles/globals.css";
import { type Metadata } from "next";
import { Section } from "@/docsComponents/SectionProvider";

export const metadata: Metadata = {
  title: {
    template: "%s - Protocol API Reference",
    default: "Protocol API Reference"
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let pages = await glob("**/*.mdx", { cwd: "src/app" });
  let allSectionsEntries = (await Promise.all(
    pages.map(async (filename) => [
      "/" + filename.replace(/(^|\/)page\.mdx$/, ""),
      (await import(`./${filename}`)).sections
    ])
  )) as Array<[string, Array<Section>]>;
  let allSections = Object.fromEntries(allSectionsEntries);

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <Providers>
          <div className="w-full">
            <Layout allSections={allSections}>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
