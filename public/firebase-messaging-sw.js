importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAdqD5UMapo8WoFUZ9Leq4lUULcZ__vKCA",
    authDomain:"graduation-ai-d062f.firebaseapp.com",
    projectId:"graduation-ai-d062f",
    messagingSenderId:"836096715886",
    appId:"1:836096715886:web:ac3e16269f23e56b978a7f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
    }
  );
});