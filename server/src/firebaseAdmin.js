// import admin from "firebase-admin";
// import dotenv from "dotenv";

// dotenv.config();

// if (!admin.apps.length) {
//   const privateKey = process.env.FIREBASE_PRIVATE_KEY
//     ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
//     : undefined;

//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey: privateKey,
//       }),
//     });
//   } catch (error) {
//     console.error("Erro ao inicializar Firebase Admin:", error);
//     throw error;
//   }
// }

// const db = admin.firestore();

// export { db };
// export default admin;

import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

console.log("PROJECT_ID existe?", !!process.env.FIREBASE_PROJECT_ID);
console.log("CLIENT_EMAIL existe?", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("PRIVATE_KEY existe?", !!process.env.FIREBASE_PRIVATE_KEY);

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = admin.firestore();

export { db };
export default admin;