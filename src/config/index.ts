import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,

  // JWT
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_pass_token_secret: process.env.RESET_PASS_TOKEN_SECRET,
  reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,

  // Bcrypt
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS),

  // Cloudinary
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

  // Stripe
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,

  // Pusher
  pusher_app_id: process.env.PUSHER_APP_ID,
  pusher_key: process.env.PUSHER_KEY,
  pusher_secret: process.env.PUSHER_SECRET,
  pusher_cluster: process.env.PUSHER_CLUSTER,

  // Gemini AI
  gemini_api_key: process.env.GEMINI_API_KEY,

  // Frontend
  frontend_url: process.env.FRONTEND_URL,
};
