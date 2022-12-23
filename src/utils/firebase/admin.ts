import { apps } from "firebase-admin";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp;
let adminDb;

if (!apps.length) {
  adminApp = initializeApp({
    credential: cert({
      clientEmail: process.env.ADMIN_CLIENT_EMAIL,
      privateKey: process.env.ADMIN_PRIVATE_KEY,
      projectId: process.env.ADMIN_PROJECT_ID,
    }),
  });

  adminDb = getFirestore(adminApp);
}

export const app = adminApp;
export const db = adminDb;
export const adminAuth = getAuth(adminApp);
