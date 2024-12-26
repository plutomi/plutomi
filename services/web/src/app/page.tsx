import GithubIcon from "@/components/icons/github";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen py-20 bg-snow">
      <main className="p-3  ">
        <h1 className="font-bold text-4xl">
          Plutomi{" "}
          <span className="text-slate-500 font-medium text-xs">(wip!)</span>
        </h1>
        <p>Making Applicant Management Great Again</p>
        <div className="flex justify-center items-center mt-4">
          <a
            href="https://github.com/plutomi/plutomi"
            className=" hover:text-slate-800 text-center hover:underline transition duration-200 flex items-center"
            target="_blank"
            rel="noreferrer noopener"
          >
            <GithubIcon width={14} height={14} />
            <span className="pl-2">View on GitHub</span>
          </a>
        </div>
      </main>
    </div>
  );
}
