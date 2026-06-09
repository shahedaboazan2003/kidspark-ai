import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") return;

  const authToken = localStorage.getItem("accessToken");

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  if (!token) return;

  localStorage.setItem("fcmToken", token);

  await fetch(
    `${import.meta.env.VITE_API_URL}/ai/fcm-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    }
  );

  console.log("FCM Token:", token);
}