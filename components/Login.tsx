import LoginEmail from "./EmailSigninInput";
import { useState } from "react";
import router from "next/router";
import AuthService from "../Adapters/AuthService";
import GoogleLoginButton from "./GoogleLoginButton";
import axios from "axios";
import { LOGIN_METHODS } from "../Config";

export default function Login({ loggedOutPageText }) {
  const [email, setemail] = useState("");
  const [submittedText, setSubmittedText] = useState(
    `We've sent a magic login link to your email!`
  );
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [buttonText, setButtonText] = useState("Send Link");

  const handleEmailChange = (newEmail) => {
    setemail(newEmail);
  };

  const sendEmail = async (e) => {
    setButtonText("Sending...");
    e.preventDefault();

    try {
      const { message } = await AuthService.login(
        email,
        `${process.env.NEXT_PUBLIC_WEBSITE_URL + router.asPath}`,
        LOGIN_METHODS.LINK
      );

      setSubmittedText(message);
      setEmailSubmitted(true);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const successfulLogin = async (response) => {
    console.log(response);
    const email = response.profileObj.email;

    try {
      const { message } = await AuthService.login(
        email,
        process.env.NEXT_PUBLIC_WEBSITE_URL + router.asPath,
        LOGIN_METHODS.GOOGLE
      );
      window.location.replace(message);
      return;
    } catch (error) {
      alert(`Error logging in with google - ${error}`);
    }
  };

  const failedLogin = (response) => {
    console.log(response);
    alert(
      `An error ocurred logging you in, please try again or log in through the magic links`
    );
  };

  return (
    <div className="flex justify-center flex-col p-10 max-w-2xl mx-auto items-center mt-20 border rounded-lg">
      <h1 className="text-4xl font-bold text-center text-dark">
        {loggedOutPageText}
      </h1>

      <div className="mt-8 space-y-4 flex flex-col justify-center items-center ">
        {emailSubmitted ? (
          <div className="text-center">
            <h1 className=" text-dark text-2xl">{submittedText}</h1>
            <p className="text-light text-lg">{email}</p>
          </div>
        ) : (
          <div className="space-y-2 flex-col items-center  justify-center  ">
            <GoogleLoginButton
              successfulLogin={successfulLogin}
              failedLogin={failedLogin}
            />
            <p className=" text-lg text-red text-center sm:max-w-8xl max-w-sm">
              OR
            </p>{" "}
            <LoginEmail
              onChange={handleEmailChange}
              email={email}
              buttonText={buttonText}
              sendEmail={sendEmail}
            />{" "}
            <p className=" text-lg text-red text-center sm:max-w-8xl max-w-sm">
              We will email you a magic link for a password-free log in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
