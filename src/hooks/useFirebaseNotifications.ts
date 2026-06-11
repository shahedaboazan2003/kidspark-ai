import { useEffect } from "react";
import { MessagePayload, onMessage } from "firebase/messaging";
import { messaging } from "../lib/firebase";
export function useFirebaseNotifications() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log(payload);

      if (payload.data.type == "Event") {
      } else {
        new Notification(payload.notification?.title || "", {
          body: payload.notification?.body,
        });
      }
    });

    return unsubscribe;
  }, []);
}

export function useNotificationHandler({
  type,
  handler,
}: {
  type: string;
  handler: (payloed: MessagePayload) => Promise<void> | void;
}) {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log(payload);

      if (payload.data.type == type) {
        handler(payload);
      }
    });

    return unsubscribe;
  }, []);
}
