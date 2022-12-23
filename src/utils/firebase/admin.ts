import { apps } from "firebase-admin";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import secret from "./secret.json";

let adminApp;
let adminDb;

if (!apps.length) {
  adminApp = initializeApp({
    credential: cert({
      clientEmail: secret.client_email,
      privateKey: secret.private_key,
      projectId: secret.project_id,
    }),
  });

  adminDb = getFirestore(adminApp);
}

export const app = adminApp;
export const db = adminDb;
export const adminAuth = getAuth(adminApp);
