import AuthService from "../adapters/AuthService";
import LoginEmail from "./EmailSigninInput";
import GoogleLoginButton from "./GoogleLoginButton";
import { useRouter } from "next/router";
import { useState } from "react";
import { DEFAULTS, DOMAIN_NAME, LOGIN_METHODS } from "../Config";

interface CallbackUrl {
  callbackUrl?: string;
}

// Identical to SignIn, but with less margin/padding to fit in the homepage
// TODO probably better to refactor this as this is bad practice
export default function LoginHomepage({ callbackUrl }: CallbackUrl) {
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
        callbackUrl,
        LOGIN_METHODS.EMAIL
      );

      setSubmittedText(message);
      setEmailSubmitted(true);
    } catch (error) {
      console.log(error);
      alert(error.response.data.message);
    }
  };

  const successfulLogin = async (response) => {
    console.log(response);
    const email = response.profileObj.email;

    const { message } = await AuthService.login(
      // TODO trycatch
      email,
      DOMAIN_NAME + DEFAULTS.REDIRECT,
      LOGIN_METHODS.GOOGLE
    );
    window.location.replace(message);
    return;
  };

  const failedLogin = (response) => {
    console.log(response);
    alert(
      `An error ocurred logging you in, please try again or log in through the magic links`
    );
  };

  return (
    <div className="space-y-4 flex justify-center flex-col w-full items-center ">
      {emailSubmitted ? (
        <div className="text-center">
          <h1 className=" text-dark text-2xl">{submittedText}</h1>
          <p className="text-light text-lg">{email}</p>
        </div>
      ) : (
        <div className="space-y-2">
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
          <p className=" text-lg text-normal text-center sm:max-w-8xl max-w-sm">
            We can email you a magic link for a password-free log in.
          </p>
        </div>
      )}
    </div>
  );
}
