import admin from "firebase-admin";
import fs from "fs";
import path from "path";


const serviceAccountPath = path.resolve("./dombosco-7b2ee-firebase-adminsdk-fbsvc-392410663d.json");


const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
