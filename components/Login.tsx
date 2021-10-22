import LoginEmail from "./EmailSigninInput";
import { useState } from "react";
import router from "next/router";
<<<<<<< HEAD:components/Login.tsx
<<<<<<< HEAD:components/Login.tsx
import AuthService from "../adapters/AuthService";
export default function Login({ desiredPageText }) {
=======
import AuthService from "../Adapters/AuthService";
=======
import AuthService from "../adapters/AuthService";
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession):components/SignIn.tsx
export default function SignIn({ callbackUrl, desiredPage }) {
>>>>>>> 2f22d4b (Added logging in with links / cookies):components/SignIn.tsx
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
        callback_url: `${process.env.PLUTOMI_URL + router.asPath}`,
      });

      setSubmittedText(message);
      setEmailSubmitted(true);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="flex justify-center flex-col p-10 max-w-2xl mx-auto items-center mt-20 border rounded-lg">
      <h1 className="text-4xl font-bold text-center text-dark">
        Sign in to view {desiredPageText}
      </h1>

      <div className="mt-8 space-y-4 flex flex-col justify-center items-center">
        {emailSubmitted ? (
          <div className="text-center">
            <h1 className=" text-dark text-2xl">{submittedText}</h1>
            <p className="text-light text-lg">{user_email}</p>
          </div>
        ) : (
          <div className="space-y-4">
<<<<<<< HEAD:components/Login.tsx
<<<<<<< HEAD:components/Login.tsx
=======
            <p className=" text-lg text-normal text-center sm:max-w-8xl max-w-sm">
              We will email you a magic link for a password-free sign in.
            </p>
>>>>>>> 2f22d4b (Added logging in with links / cookies):components/SignIn.tsx
=======
>>>>>>> 12d77e0 (Replaced withauthorizer with withSession):components/SignIn.tsx
            <LoginEmail
              onChange={handleEmailChange}
              user_email={user_email}
              button_text={button_text}
              sendEmail={sendEmail}
            />{" "}
            <p className=" text-lg text-normal text-center sm:max-w-8xl max-w-sm">
              We will email you a magic link for a password-free sign in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
