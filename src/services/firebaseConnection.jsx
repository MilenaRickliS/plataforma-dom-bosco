
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDIatsrMaVKn1AWw7nVrMapk2S2NjvJaDE",
  authDomain: "dombosco-7b2ee.firebaseapp.com",
  projectId: "dombosco-7b2ee",
  storageBucket: "dombosco-7b2ee.firebasestorage.app",
  messagingSenderId: "327731604818",
  appId: "1:327731604818:web:03c8379f707e7bf2385e8b",
  measurementId: "G-D6WZJJ82BX"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage, provider };