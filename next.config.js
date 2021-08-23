module.exports = {
  target: "serverless",
  env: {
    WEBSITE_BUCKET_NAME: process.env.WEBSITE_BUCKET_NAME,
    CLOUDFRONT_ID: process.env.CLOUDFRONT_ID,
    DEFAULT_LAMBDA_NAME: process.env.DEFAULT_LAMBDA_NAME,
    API_LAMBDA_NAME: process.env.API_LAMBDA_NAME,
    IMAGE_LAMBDA_NAME: process.env.IMAGE_LAMBDA_NAME,
    DOMAIN_NAME: process.env.DOMAIN_NAME,
  },
};
