import NextAuth, { Session, User } from "next-auth";
import Providers from "next-auth/providers";
import { CreateUserIfNotExists } from "../../../utils/users/createUserIfNotExists";
import InputValidation from "../../../utils/inputValidation";
import { GetLatestLoginCode } from "../../../utils/users/getLatestLoginCode";
import { GetCurrentTime } from "../../../utils/time";
import { ClaimLoginCode } from "../../../utils/users/claimLoginCode";
import { GetUserByEmail } from "../../../utils/users/getUserByEmail";
import { JWT } from "next-auth/jwt";
export default NextAuth({
  // Configure one or more authentication providers
  // Configure one or more authentication providers
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorizationUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code",
    }),
    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Login Code",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        login_code: { label: "Code", type: "text", placeholder: "J8S73SOEL1" },
        user_email: { label: "Email", type: "email" },
      },
      async authorize(credentials, req) {
        console.log(credentials, req.body);
        const { user_email, login_code } = credentials;

        try {
          InputValidation({ user_email, login_code });
        } catch (error) {
          console.log("Error validating input", error);
          throw new Error(error);
        }

        console.log("getting latest code");

        const latest_login_code = await GetLatestLoginCode(user_email);
        console.log("latest code", latest_login_code);

        if (latest_login_code.login_code != login_code) {
          // TODO mark this as a bad attempt and delete the code
          console.log("error invalid code");

          throw new Error("Invalid Code");
        }

        if (latest_login_code.expires_at <= GetCurrentTime("iso")) {
          console.log("expired code ");

          throw new Error("Code has expired");
        }

        if (latest_login_code.is_claimed) {
          console.log("code has been claimed ");

          throw new Error("Code has already been claimed"); // TODO or invalid code msg?
        }

        const claim_code_input: ClaimLoginCodeInput = {
          user_id: latest_login_code.user_id,
          timestamp: latest_login_code.created_at,
          claimed_at: GetCurrentTime("iso") as string,
        };
        console.log("Claiming  code ");

        await ClaimLoginCode(claim_code_input);
        console.log("Code claimed, getting user");

        const user = await GetUserByEmail(user_email);
        console.log("Got user", user);

        if (user) {
          console.log("Returning user", user);
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          console.log("Returning null");

          // If you return null or false then the credentials will be rejected
          return null;
          // You can also Reject this callback with an Error or with a URL:
          // throw new Error('error message') // Redirect to error page
          // throw '/path/to/redirect'        // Redirect to a URL
        }
      },
    }),
  ],

  callbacks: {
    async session(session: Session, user) {
      // Send the user to the client
      session.user = user.user;
      return session;
    },
    async jwt(
      token: any,
      user: any,
      account: any,
      profile: any,
      isNewUser: any
    ) {
      if (user) {
        console.log("USER IN JWT", user); // TODO user.email exists on google sign in

        /**
         * When signing in with Google, the email value is of the Google account at user.email
         * We could save a call here by only checking if `user.email` exists (AKA Google sign in)
         */

        const signed_in_user = await GetUserByEmail(
          user.email || user.user_email
        );
        token.user = signed_in_user;
      }
      return token;
    },
  },

  debug: true,
  session: {
    jwt: true,
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    // You can generate a signing key using `jose newkey -s 512 -t oct -a HS512`
    // This gives you direct knowledge of the key used to sign the token so you can use it
    // to authenticate indirectly (eg. to a database driver)
    // signingKey: {"kty":"oct","kid":"Dl893BEV-iVE-x9EC52TDmlJUgGm9oZ99_ZL025Hc5Q","alg":"HS512","k":"K7QqRmJOKRK2qcCKV_pi9PSBv3XP0fpTu30TP8xn4w01xR3ZMZM38yL2DnTVPVw6e4yhdh0jtoah-i4c_pZagA"},
    // If you chose something other than the default algorithm for the signingKey (HS512)
    // you also need to configure the algorithm
    // verificationOptions: {
    //    algorithms: ['HS256']
    // },
    // Set to true to use encryption. Defaults to false (signing only).
    // encryption: true,
    // encryptionKey: "",
    // decryptionKey = encryptionKey,
    // decryptionOptions = {
    //    algorithms: ['A256GCM']
    // },
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // async encode({ secret, token, maxAge }) {},
    // async decode({ secret, token, maxAge }) {},
  },
});
