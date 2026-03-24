import axios from "axios";
import { env } from "../config/env.js";

export const kitchenClient = axios.create({
  baseURL: env.KITCHEN_SERVICE_URL,
  timeout: 5000,
});

export const authClient = axios.create({
  baseURL: env.AUTH_SERVICE_URL,
  timeout: 5000,
});

export const notificationClient = axios.create({
  baseURL: env.NOTIFICATION_SERVICE_URL,
  timeout: 3000,
});
