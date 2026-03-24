import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  frontend_url: process.env.FRONTEND_URL,
  backend_base_url: process.env.BACKEND_IMAGE_URL,
  port: process.env.PORT,

  // Payment configurations
  toyyibpay: {
    toyyibpay_secret_key: process.env.TOYYIB_SECRET_KEY,
    toyyibpay_category_code: process.env.TOYYIB_CATEGORY_CODE,
    toyyibpay_webhook_secret: process.env.TOYYIB_WEBHOOK_SECRET,
    toyyibpay_return_url: process.env.TOYYIB_RETURN_URL,
    toyyibpay_callback_url: process.env.TOYYIB_CALLBACK_URL,
  },

  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },

  reset_pass_link: process.env.RESET_PASS_LINK,

  emailSender: {
    email: process.env.NODEMAILER_EMAIL || process.env.EMAIL,
    app_pass: process.env.NODEMAILER_PASSWORD || process.env.APP_PASS,
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};
