// config/firebase.js
// Firebase Admin SDK setup — Google Sign-in se aaye tokens verify karne ke liye

import admin from 'firebase-admin';

// .env se Firebase credentials aate h
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // \n ko real newline mein convert karta h
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

// Firebase Admin initialize karo (sirf ek baar)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
  });
}

export default admin;