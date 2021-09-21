// This is the same as the SignIn.tsx component
// but with different styling so it fits in the home page
// TODO probably better to refactor this

import { signIn } from "next-auth/client";
import GoogleButton from "./Buttons/GoogleButton";
import axios from "axios";
import LoginCode from "./EmailSigninCode";
import LoginEmail from "./EmailSigninInput";
import { FormEvent, useState } from "react";
interface CallbackUrl {
  callbackUrl?: string;
}

import router from "next/router";
// Identical to SignIn, but with less margin/padding to fit in the homepage
export default function SignInHomepage({ callbackUrl }: CallbackUrl) {
  const [user_email, setUserEmail] = useState("");
  const [login_code, setLoginCode] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [button_text, setButtonText] = useState("Send Code");

  const handleEmailChange = (newEmail) => {
    setUserEmail(newEmail);
  };

  const handleLoginCodeChange = (newCode) => {
    setLoginCode(newCode);
  };

  const sendEmail = async (e) => {
    setButtonText("Sending...");
    e.preventDefault();
    const body = {
      user_email: user_email,
    };

    try {
      const { status, data } = await axios.post("/api/auth/login-code", body);
      setEmailSubmitted(true);
      alert(data.message);
      setButtonText("Submit");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const signInWithCode = async (e: FormEvent) => {
    setButtonText("Signing in...");
    e.preventDefault();

    // https://next-auth.js.org/v3/getting-started/client#using-the-redirect-false-option
    const { error } = await signIn("credentials", {
      redirect: false,
      user_email: user_email,
      login_code: login_code,
      callbackUrl: callbackUrl,
    });

    if (error) {
      alert(error); // TODO limit attempts
      setButtonText("Submit");
      return;
    }

    router.push(callbackUrl);
  };
  return (
    <div className="flex justify-center flex-col w-full items-center ">
      <GoogleButton callbackUrl={callbackUrl} />
      <p className="my-4 text-lg text-light text-center sm:max-w-8xl max-w-sm">
        Or we can email you a magic code for a password-free sign in.
      </p>
      {emailSubmitted ? (
        <LoginCode
          onChange={handleLoginCodeChange}
          login_code={login_code}
          button_text={button_text}
          signInWithCode={signInWithCode}
        />
      ) : (
        <LoginEmail
          onChange={handleEmailChange}
          user_email={user_email}
          button_text={button_text}
          sendEmail={sendEmail}
        />
      )}
    </div>
  );
}
