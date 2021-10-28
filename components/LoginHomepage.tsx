// This is the same as the SignIn.tsx component
// but with different styling so it fits in the home page
// TODO probably better to refactor this as this is bad practice
import AuthService from "../adapters/AuthService";
import LoginEmail from "./EmailSigninInput";
import { useState } from "react";
interface CallbackUrl {
  callbackUrl?: string;
}

// Identical to SignIn, but with less margin/padding to fit in the homepage
export default function LoginHomepage({ callbackUrl }: CallbackUrl) {
  const [user_email, setUserEmail] = useState("");
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
      const { message } = await AuthService.createLoginLink({
        user_email: user_email,
        callback_url: callbackUrl,
        login_method: "LINK",
      });

      setSubmittedText(message);
      setEmailSubmitted(true);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="space-y-4 flex justify-center flex-col w-full items-center ">
      {emailSubmitted ? (
        <div className="text-center">
          <h1 className=" text-dark text-2xl">{submittedText}</h1>
          <p className="text-light text-lg">{user_email}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <LoginEmail
            onChange={handleEmailChange}
            user_email={user_email}
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
