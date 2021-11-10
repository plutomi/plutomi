module.exports = {
  // reactStrictMode: true,
  target: "serverless",
  env: {
    WEBSITE_BUCKET_NAME: process.env.WEBSITE_BUCKET_NAME,
    CLOUDFRONT_ID: process.env.CLOUDFRONT_ID,
    DEFAULT_LAMBDA_NAME: process.env.DEFAULT_LAMBDA_NAME,
    API_LAMBDA_NAME: process.env.API_LAMBDA_NAME,
    IMAGE_LAMBDA_NAME: process.env.IMAGE_LAMBDA_NAME,
    DOMAIN_NAME: process.env.DOMAIN_NAME,
    DYNAMO_TABLE_NAME: process.env.DYNAMO_TABLE_NAME,
    LAMBDA_ROLE_ARN: process.env.LAMBDA_ROLE_ARN,
    WEBSITE_URL: process.env.WEBSITE_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },

  async redirects() {
    return [
      {
        source: "/openings/:any*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/stages/:any*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/profile/:any*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/team/:any*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/domains/:any*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/dashboard/:any*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};
