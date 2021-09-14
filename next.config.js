module.exports = {
  // target: "serverless",
  env: {
    WEBSITE_BUCKET_NAME: process.env.WEBSITE_BUCKET_NAME,
    CLOUDFRONT_ID: process.env.CLOUDFRONT_ID,
    DEFAULT_LAMBDA_NAME: process.env.DEFAULT_LAMBDA_NAME,
    API_LAMBDA_NAME: process.env.API_LAMBDA_NAME,
    IMAGE_LAMBDA_NAME: process.env.IMAGE_LAMBDA_NAME,
    DOMAIN_NAME: process.env.DOMAIN_NAME,
    ID_LENGTH: process.env.ID_LENGTH,
    DYNAMO_TABLE_NAME: process.env.DYNAMO_TABLE_NAME,
    LAMBDA_ROLE_ARN: process.env.LAMBDA_ROLE_ARN,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_PASSWORD: process.env.SESSION_PASSWORD,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};
