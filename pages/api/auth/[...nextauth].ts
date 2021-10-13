import { GetUserByEmail } from "../../../utils/users/getUserByEmail";
import { CreateUser } from "../../../utils/users/createUser";
import DeleteLoginLink from "../../../utils/loginLinks/deleteLoginLink";
import CreateLoginEvent from "../../../utils/users/createLoginEvent";
import InputValidation from "../../../utils/inputValidation";
import { GetCurrentTime } from "../../../utils/time";
import Providers from "next-auth/providers";
import { createHash } from "crypto";
import NextAuth, { User } from "next-auth";
import { GetLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
import { GetUserById } from "../../../utils/users/getUserById";
import UpdateLoginLink from "../../../utils/loginLinks/updateLoginLink";

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
      name: "Login Link",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        user_id: { label: "ID", type: "text", placeholder: "J8S73SOEL1" },
        key: { label: "Key", type: "text" },
      },
      async authorize(credentials) {
        const { user_id, key } = credentials;

        try {
          InputValidation({ user_id, key });
        } catch (error) {
          throw new Error(error);
        }

        const latest_login_link = await GetLatestLoginLink(user_id);

        if (!latest_login_link) {
          throw new Error("Invalid link");
        }

        const hash = createHash("sha512").update(key).digest("hex");

        if (hash != latest_login_link.login_link_hash) {
          /**
           * Someone could theoretically try to guess a user ID and the 1500 char long key lol
           * If they do get someone's ID correct in that 15 minute window to sign in AND they key is wrong...
           * Suspend the key so it cant' be used.
           */
          // TODO - They can theoretically just make another one after 15 minutes or whatever the timer is
          // However, one attempt at 1500 characters every 15 minutes... good luck!

          const login_link_timestamp = latest_login_link.created_at;
          const updated_login_link = {
            ...latest_login_link,
            link_status: "SUSPENDED",
          };

          await UpdateLoginLink({
            user_id,
            login_link_timestamp,
            updated_login_link,
          });
          throw new Error(
            "Your login link has been suspended. Please try again later."
          );
        }

        // Lock account if already suspended
        if (latest_login_link.link_status === "SUSPENDED") {
          throw new Error(
            "Your account has been locked due to suspicous activity. Please try again later or email support@plutomi.com"
          );
        }

        if (latest_login_link.expires_at <= GetCurrentTime("iso")) {
          throw new Error("This link has expired");
        }

        // TODO delete link
        const user = await GetUserById(user_id);

        if (user && latest_login_link) {
          await CreateLoginEvent(user_id);
          // Invalidates the last login link while allowing the user to login again
          await DeleteLoginLink(user_id, latest_login_link.created_at);

          // Any object returned will be saved in `user` property of the JWT
          return user;
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
    async jwt(
      token: any,
      user: any,
      account: any,
      profile: any,
      isNewUser: any
    ) {
      if (user) {
        /**
         * When signing in with Google, the email value is of the Google account is at user.email
         * We could save a call here by only checking if `user.email` exists (AKA Google sign in)
         */

        const create_user_input: CreateUserInput = {
          first_name: "NO_FIRST_NAME",
          last_name: "NO_LAST_NAME",
          user_email: user.email || user.user_email,
        };

        let existing_user = await GetUserByEmail(user.email || user.user_email);
        
        if (!existing_user) {
          existing_user = await CreateUser(create_user_input);
        }

        // Sets id in the token so that it can be accessed in withAuthorizer
        token.user_id = existing_user.user_id;
        token.user_email = existing_user.user_email;
        await CreateLoginEvent(existing_user.user_id);
      }

      return token;
    },
    async session(session: CustomSession, user) {
      // Sets values to be accessed by the client to make api calls
      session.user_id = user?.user_id;
      session.user_email = user?.user_email;
      return session;
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
