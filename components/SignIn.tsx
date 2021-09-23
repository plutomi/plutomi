import { signIn } from "next-auth/client";
import GoogleButton from "./Buttons/GoogleButton";
import axios from "axios";
import LoginCode from "./EmailSigninCode";
import LoginEmail from "./EmailSigninInput";
import { FormEvent, useState } from "react";
import router from "next/router";

export default function SignIn({ callbackUrl, desiredPage }) {
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
    const body: APICreateLoginCodeInput = {
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
    <div className="flex justify-center flex-col p-10 max-w-2xl mx-auto items-center mt-20 border rounded-lg">
      <h1 className="text-4xl font-bold text-center text-dark">
        Sign in to view {desiredPage}
      </h1>

      <div className="mt-8 flex flex-col justify-center items-center">
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
    </div>
  );
}
