import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
const firebaseConfig = {
    apiKey: "AIzaSyAdqD5UMapo8WoFUZ9Leq4lUULcZ__vKCA",
    authDomain:"graduation-ai-d062f.firebaseapp.com",
    projectId:"graduation-ai-d062f",
    messagingSenderId:"836096715886",
    appId:"1:836096715886:web:ac3e16269f23e56b978a7f"
}

const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)