import { signIn } from "next-auth/client";
import GoogleButton from "./Buttons/GoogleButton";
import axios from "axios";
import LoginCode from "./EmailSigninCode";
import LoginEmail from "./EmailSigninInput";
import { useState } from "react";
interface CallbackUrl {
  callbackUrl?: string;
}
// Identical to SignIn, but with less margin/padding to fit in the homepage
export default function SignInHomepage({ callbackUrl }: CallbackUrl) {
  const [user_email, setUserEmail] = useState("");
  const [login_code, setLoginCode] = useState("");
  const [emailSubmitted, setemailSubmitted] = useState(false);

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
      setemailSubmitted(true);
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
    <div className="flex justify-center flex-col w-full items-center ">
      <GoogleButton callbackUrl={callbackUrl} />
      <p className="my-4 text-lg text-blue-gray-600 text-center sm:max-w-8xl max-w-sm">
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
  );
}
