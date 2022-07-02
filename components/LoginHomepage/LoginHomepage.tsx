import { useState } from 'react';
import { RequestLoginLink } from '../../adapters/Auth';
import { DEFAULTS } from '../../Config';
import { EmailLoginInput } from '../EmailLoginInput';

interface LoginHomepageProps {
  callbackUrl?: string;
}

// Identical to SignIn, but with less margin/padding to fit in the homepage
// TODO probably better to refactor this as this is bad practice
export const LoginHomepage = ({ callbackUrl }: LoginHomepageProps) => {
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
      });

      setSubmittedText(data.message);
      setEmailSubmitted(true);
    } catch (error) {
      setButtonText('Login');
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
          <EmailLoginInput
            onChange={handleEmailChange}
            email={email}
            buttonText={buttonText}
            sendEmail={sendEmail}
          />{' '}
          <p className=" text-lg text-normal text-center sm:max-w-8xl max-w-sm">
            We will email you a magic link for a password-free log in.
          </p>
        </div>
      )}
    </div>
  );
};
