import { useState } from 'react';
import { RequestLoginLink } from '../../adapters/Auth';
import { EmailLoginInput } from '../EmailLoginInput';
import { LoginHomepage } from '../LoginHomepage';

interface LoginPageProps {
  loggedOutPageText: string;
}
export const Login = ({ loggedOutPageText }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [submittedText, setSubmittedText] = useState(
    `We've sent a magic login link to your email!`,
  );
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [buttonText, setButtonText] = useState('Login');

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
  };

  const sendEmail = async (e) => {
    setButtonText('Sending...');
    e.preventDefault();

    try {
      const { data } = await RequestLoginLink({
        email,
        callbackUrl: window.location.href,
      });

      setSubmittedText(data.message);
      setEmailSubmitted(true);
    } catch (error) {
      setButtonText('Login');
      alert(error.response.data.message);
    }
  };

  return (
    <div className="flex justify-center flex-col p-10 max-w-2xl mx-auto items-center mt-20 border rounded-lg">
      <h1 className="text-4xl font-bold text-center text-dark">{loggedOutPageText}</h1>

      <div className="mt-8 space-y-4 flex flex-col justify-center items-center ">
        {emailSubmitted ? (
          <div className="text-center">
            <h1 className=" text-dark text-2xl">{submittedText}</h1>
            <p className="text-light text-lg">{email}</p>
          </div>
        ) : (
          <div className="space-y-2 flex-col items-center  justify-center  ">
            <EmailLoginInput
              onChange={handleEmailChange}
              email={email}
              buttonText={buttonText}
              sendEmail={sendEmail}
            />{' '}
            <p className=" text-lg text-red text-center sm:max-w-8xl max-w-sm">
              We will email you a magic link for a password-free log in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
