import { GoogleLogin } from "react-google-login";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";
export default function GoogleLoginButton({ successfulLogin, failedLogin }) {
  const router = useRouter();
  FcGoogle;
  return (
    <div className="my-4 text-xl">
      <GoogleLogin
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        buttonText="Login"
        onSuccess={successfulLogin}
        onFailure={failedLogin}
        cookiePolicy={"single_host_origin"}
        render={(renderProps) => (
          <button
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
            className="border-2 border-blue-gray-200 rounded-lg px-3 py-2  flex space-x-4 justify-center items-center"
          >
            <FcGoogle className="w-6 h-6" />
            <p>Log in with Google</p>
          </button>
        )}
      />
    </div>
  );
}
