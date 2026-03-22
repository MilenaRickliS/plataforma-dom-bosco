import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();


if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectid: process.env.FIREBASE_PROJECT_ID,
        clientemail: process.env.FIREBASE_CLIENT_EMAIL,
        privatekey: privateKey,
      }),
    });
  } catch (error) {
    console.error("Erro ao inicializar Firebase Admin:", error);
  }
}

const db = admin.firestore();

export { db };      
export default admin;
