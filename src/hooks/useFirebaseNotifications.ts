import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../lib/firebase"
export function useFirebaseNotifications() {
  useEffect(() => {
    const unsubscribe = onMessage(
      messaging,
      (payload) => {
        console.log(payload);

        new Notification(
          payload.notification?.title || "",
          {
            body: payload.notification?.body,
          }
        );
      }
    );

    return unsubscribe;
  }, []);
}