// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging"; // Messaging 관련 함수 import

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FCM_apiKey,
  authDomain: import.meta.env.VITE_FCM_authDomain,
  projectId: import.meta.env.VITE_FCM_projectId,
  storageBucket: import.meta.env.VITE_FCM_storageBucket,
  messagingSenderId: import.meta.env.VITE_FCM_messagingSenderId,
  appId: import.meta.env.VITE_FCM_appId,
  measurementId: import.meta.env.VITE_FCM_measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging
const messaging = getMessaging(app);

// Export messaging and onMessage to use in other parts of your app
export { messaging, onMessage };
