import { GoogleLogin } from "react-google-login";
import { useRouter } from "next/router";

export default function GoogleLoginButton({ successfulLogin, failedLogin }) {
  const router = useRouter();

  return (
    <div className="my-4 text-xl">
      <GoogleLogin
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        buttonText="Login"
        onSuccess={successfulLogin}
        onFailure={failedLogin}
        cookiePolicy={"single_host_origin"}
      />
    </div>
  );
}
