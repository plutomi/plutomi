import { BsGithub, BsTwitter } from "react-icons/bs";
import { FiExternalLink, FiMail } from "react-icons/fi";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Schema } from "@plutomi/validation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "../Button";
import { handleAxiosError } from "../../utils/handleAxiosResponse";

const cards = [
  {
    icon: <BsGithub className="h-16 w-16" aria-hidden="true" color="#333" />,
    href: "https://github.com/plutomi/plutomi",
    innerContent: (
      <dd className="mt-2 leading-7 text-slate-500">
        The entire codebase for Plutomi is available for{" "}
        <span className="font-bold">free</span> on GitHub under an Apache 2
        license :)
      </dd>
    )
  },
  {
    icon: (
      <BsTwitter className="h-16 w-16" aria-hidden="true" color="#00acee" />
    ),
    href: "https://twitter.com/notjoswayski",
    innerContent: (
      <dd className="mt-2 leading-7 text-slate-500">
        <span className="font-bold">Jose Valerio</span> is the owner of Plutomi
        - you can follow him on Twitter.
      </dd>
    )
  }
];

type WaitlistFormValues = {
  email: string;
  isloading: boolean
};

export const WaitListCard: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WaitlistFormValues>();

  const subscribe = useMutation({
    mutationFn: async (data: WaitlistFormValues) =>
      axios.post("/api/waitlist", data),

    onError: (error) => {
      const message = handleAxiosError(error);
      toast.error(message);
    }
  });

  const onSubmit: SubmitHandler<WaitlistFormValues> = async (data) => {
    subscribe.mutate(data);
  };

  return (
    <div className="relative isolate overflow-hidden bg-white py-16 sm:py-12 lg:py-18   drop-shadow-sm border rounded-lg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 ">
        <div className="  items-center  mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-2xl  h-full space-y-5 ">
            <div className="">
              <h2 className="text-3xl font-medium tracking-tight text-slate-700 sm:text-4xl">
                Hi there! Thank&apos;s for checking us out.
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-500">
                This site is still under construction, but if you&apos;re
                interested in being notified when Plutomi is ready for use,
                please join our wait list!
              </p>
            </div>
            <div className="">
              {subscribe.isSuccess ? (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Awesome, we&apos;ll let you know when things are ready!
                        🚀
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <form
                    className="relative flex  gap-x-4 space-between w-full"
                    onSubmit={(e) => void handleSubmit(onSubmit)(e)}
                  >
                    <label htmlFor="waitlist-email" className="sr-only">
                      Email address
                    </label>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FiMail
                        className="h-5 w-5 text-slate-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="beans"
                      type="waitlist-email"
                      autoComplete="email"
                      disabled={false}
                      {...register("email")}
                      className="flex placeholder-slate-400 disabled:bg-slate-100  disabled:border-slate-100 disabled:text-slate-400 max-w-lg w-full pl-10 flex-auto rounded-md border bg-white/5 px-3.5 py-2 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2  focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 focus:outline-none"
                      placeholder="Enter your email"
                    />

                    <Button size="medium" isLoading={false}>
                      {false ? "Joining..." : "Join"}
                    </Button>
                  </form>
                  {errors.email?.message !== undefined ? (
                    <p className="text-red-500">{errors.email.message}</p>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 ">
            {cards.map((card) => (
              <div
                aria-hidden="true"
                key={card.href}
                onClick={() =>
                  window.open(card.href, "_blank", "noopener noreferrer")
                }
                className="transition ease-in-out duration-300  cursor-pointer flex flex-col items-start bg-slate-50 shadow-inner rounded-xl p-4  hover:bg-slate-100 "
              >
                <div className="flex flex-end w-full justify-end">
                  <button
                    className="inline-block text-slate-500 px-2 py-0"
                    type="button"
                  >
                    <FiExternalLink className="h-6 w-6 text-slate-500" />
                  </button>
                </div>

                <div className="flex flex-col justify-center items-center ">
                  <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 ">
                    {card.icon}
                  </div>
                  {card.innerContent}
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2  xl:-top-6"
        aria-hidden="true"
      >
        {/* <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
          }}
        /> */}

        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#8A3FFC"
            d="M49.7,-49.6C56.6,-42.9,48.8,-21.5,49,0.3C49.3,22,57.6,43.9,50.8,58.5C43.9,73.1,22,80.3,0.1,80.1C-21.7,80,-43.4,72.6,-55.1,58C-66.7,43.4,-68.3,21.7,-62.9,5.4C-57.4,-10.8,-45,-21.7,-33.3,-28.4C-21.7,-35.1,-10.8,-37.7,5.3,-43C21.5,-48.3,42.9,-56.3,49.7,-49.6Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </div>
  );
};
