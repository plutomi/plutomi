import { GetLatestLoginCode } from "../../../utils/loginCodes/getLatestLoginCode";
import { ClaimLoginCode } from "../../../utils/loginCodes/claimLoginCode";
import { GetUserByEmail } from "../../../utils/users/getUserByEmail";
import { CreateUser } from "../../../utils/users/createUser";
import InputValidation from "../../../utils/inputValidation";
import { GetCurrentTime } from "../../../utils/time";
import Providers from "next-auth/providers";
import NextAuth from "next-auth";

export default NextAuth({
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
      async authorize(credentials) {
        const { user_email, login_code } = credentials;

        try {
          InputValidation({ user_email, login_code });
        } catch (error) {
          throw new Error(error);
        }

        const latest_login_code = await GetLatestLoginCode(user_email);

        if (latest_login_code.login_code != login_code) {
          // TODO mark this as a bad attempt and delete the code after a few tries

          throw new Error("Invalid Code");
        }

        if (latest_login_code.expires_at <= GetCurrentTime("iso")) {
          throw new Error("Code has expired");
        }

        const claim_code_input: ClaimLoginCodeInput = {
          user_id: latest_login_code.user_id,
          timestamp: latest_login_code.created_at,
          claimed_at: GetCurrentTime("iso") as string,
        };

        await ClaimLoginCode(claim_code_input);

        const signed_in_user = await GetUserByEmail(user_email);

        /**
         * TODO *thoroughly* limit what is returned to the client here.
         * Limit to name, ID, email, and org, etc.
         **/

        if (signed_in_user) {
          // Any object returned will be saved in `user` property of the JWT
          return signed_in_user;
        } else {
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
    async session(session: CustomSession, user) {
      // Sets values to be accessed by the client to make api calls
      session.user_id = user?.user_id;
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
        /**
         * When signing in with Google, the email value is of the Google account at user.email
         * We could save a call here by only checking if `user.email` exists (AKA Google sign in)
         */

        const create_user_input: CreateUserInput = {
          first_name: "NO_FIRST_NAME",
          last_name: "NO_LAST_NAME",
          user_email: user.email || user.user_email,
        };

        console.log("Checking for exisiting user");
        let existing_user = await GetUserByEmail(user.email || user.user_email);

        if (!existing_user) {
          console.log("Existing user not found");

          existing_user = await CreateUser(create_user_input);
        }
        console.log("Found!");

        // Sets id in the token so that it can be accessed in withAuthorizer
        token.user_id = existing_user.user_id;
      }
      return token;
    },
  },

  debug: true,
  session: {
    jwt: true,
    maxAge: 1 * 24 * 60 * 60, // 1 day // TODO lower this
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
