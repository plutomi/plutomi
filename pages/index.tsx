/* This example requires Tailwind CSS v2.0+ */
import NewPricing from "../components/Pricing";
import { signOut, useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";
import GoogleButton from "../components/GoogleButton";
import Contact from "../components/ContactUs";
import DefaultSignin from "./DefaultSignin";
import FeatureBox from "../components/featureBox";
import Navbar from "../components/navbar";
import axios from "axios";
import LoginCode from "../components/LoginCode";
import Hero from "../components/Hero";
import LoginEmail from "../components/LoginEmail";
import Link from "next/dist/client/link";
import { ReactEventHandler, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/outline";
export default function Main() {
  return (
    <div className="">
      <main className="bg-gradient-to-b from-blue-gray-50 to-white">
        <Navbar />

        <Hero />
        <DefaultSignin />
        <FeatureBox />
      </main>
      <section className="relative border-0 ">
        <div className="custom-shape-divider-top-1630498878">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      <section id="pricing">
        <NewPricing />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </div>
  );
}
