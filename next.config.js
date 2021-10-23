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
<<<<<<< HEAD
<<<<<<< HEAD
    PLUTOMI_URL: process.env.PLUTOMI_URL,
=======
    JWT_SECRET: process.env.JWT_SECRET,
<<<<<<< HEAD
    NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
>>>>>>> 2f22d4b (Added logging in with links / cookies)
=======
=======
>>>>>>> 35ce39a (feat: Added ability to get all applicants by opening)
    PLUTOMI_URL: process.env.PLUTOMI_URL,
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
  },
};
