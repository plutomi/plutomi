import { signIn } from "next-auth/client";
import GoogleButton from "./Buttons/GoogleButton";
import axios from "axios";
import LoginCode from "./EmailSigninCode";
import LoginEmail from "./EmailSigninInput";
import { useState } from "react";

export default function SignIn({ callbackUrl, desiredPage }) {
  const [user_email, setUserEmail] = useState("");
  const [login_code, setLoginCode] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailChange = (newEmail) => {
    setUserEmail(newEmail);
  };

  const handleLoginCodeChange = (newCode) => {
    setLoginCode(newCode);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    const body = {
      user_email: user_email,
    };

    try {
      const { status, data } = await axios.post("/api/auth/login-code", body);
      setEmailSubmitted(true);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const signInWithCode = (e) => {
    e.preventDefault();

    signIn("credentials", {
      user_email: user_email,
      login_code: login_code,
      callbackUrl: callbackUrl,
    });
  };

  return (
    <div className="flex justify-center flex-col p-10 max-w-2xl mx-auto items-center mt-20 border rounded-lg">
      <h1 className="text-4xl font-bold text-center text-normal">
        Sign in to view {desiredPage}
      </h1>

      <div className="mt-8 flex flex-col justify-center items-center">
        <GoogleButton callbackUrl={callbackUrl} />

        <p className="my-4 text-lg text-normal text-center sm:max-w-8xl max-w-sm">
          Or we can email you a magic code for a password-free sign in.
        </p>
        {emailSubmitted ? (
          <LoginCode
            onChange={handleLoginCodeChange}
            login_code={login_code}
            signInWithCode={signInWithCode}
          />
        ) : (
          <LoginEmail
            onChange={handleEmailChange}
            user_email={user_email}
            sendEmail={sendEmail}
          />
        )}
      </div>
    </div>
  );
}
