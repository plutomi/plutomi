import AuthService from "../adapters/AuthService";
import LoginEmail from "./EmailSigninInput";
import { useState } from "react";
import { DEFAULTS } from "../Config";

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
      const { message } = await AuthService.requestLoginLink(
        email,
        window.location.href + DEFAULTS.REDIRECT
      );

      setSubmittedText(message);
      setEmailSubmitted(true);
    } catch (error) {
      console.log(error);
      alert(error.response.data.message);
    }
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
          <LoginEmail
            onChange={handleEmailChange}
            email={email}
            buttonText={buttonText}
            sendEmail={sendEmail}
          />{" "}
          <p className=" text-lg text-normal text-center sm:max-w-8xl max-w-sm">
            We will email you a magic link for a password-free log in.
          </p>
        </div>
      )}
    </div>
  );
}
