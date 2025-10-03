import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.resolve("./dombosco-7b2ee-firebase-adminsdk-fbsvc-0fa0a18458.json");

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error("JSON da conta de serviço não encontrado!");
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
