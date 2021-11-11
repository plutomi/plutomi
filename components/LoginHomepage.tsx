import AuthService from "../adapters/AuthService";
import LoginEmail from "./EmailSigninInput";
import GoogleLoginButton from "./GoogleLoginButton";
import { useRouter } from "next/router";
import { useState } from "react";

interface CallbackUrl {
  callbackUrl?: string;
}

// Identical to SignIn, but with less margin/padding to fit in the homepage
// TODO probably better to refactor this as this is bad practice
export default function LoginHomepage({ callbackUrl }: CallbackUrl) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [submittedText, setSubmittedText] = useState(
    `We've sent a magic login link to your email!`
  );
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [button_text, setButtonText] = useState("Send Link");

  const handleEmailChange = (newEmail) => {
    setUserEmail(newEmail);
  };

  const sendEmail = async (e) => {
    setButtonText("Sending...");
    e.preventDefault();

    try {
      const { message } = await AuthService.login({
        userEmail: userEmail,
        callbackUrl: callbackUrl,
        loginMethod: "LINK",
      });

      setSubmittedText(message);
      setEmailSubmitted(true);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const successfulLogin = async (response) => {
    console.log(response);
    const userEmail = response.profileObj.email;

    const input = {
      userEmail: userEmail,
      callbackUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`, // TODO make this a config variable as the "DEFAULT_REDIRECT_ROUTE_HOMEPAGE"
      loginMethod: "GOOGLE",
    };
    console.log(input);
    const { message } = await AuthService.login(input);

    window.location.replace(message);
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
          <p className="text-light text-lg">{userEmail}</p>
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
            userEmail={userEmail}
            button_text={button_text}
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
