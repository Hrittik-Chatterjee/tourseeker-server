import Pusher from "pusher";
import config from "../../config";

// Initialize Pusher
export const pusher = new Pusher({
  appId: config.pusher_app_id as string,
  key: config.pusher_key as string,
  secret: config.pusher_secret as string,
  cluster: config.pusher_cluster as string,
  useTLS: true,
});
