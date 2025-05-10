import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyBqgPMKRYDne83kk5o3QpbK0y0ZTyJLBoM",
  authDomain: "chat-app-13e0a.firebaseapp.com",
  projectId: "chat-app-13e0a",
  storageBucket: "chat-app-13e0a.firebasestorage.app",
  messagingSenderId: "61317452666",
  appId: "1:61317452666:web:f63f7cf72ef8045b6bfcc3",
  measurementId: "G-QG6BG1G6ZY",
}

export function initializeFirebase() {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig)

    // Only initialize analytics on the client side
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported) {
          getAnalytics(app)
        }
      })
    }

    return app
  }
  return getApps()[0]
}

export const db = getFirestore(initializeFirebase())
export const auth = getAuth(initializeFirebase())
