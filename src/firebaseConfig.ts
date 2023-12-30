import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyDDOrQT4HM5I_X2OV25WPLMyGlCYlsyl14",
  authDomain: "card-compare.firebaseapp.com",
  projectId: "card-compare",
  storageBucket: "card-compare.appspot.com",
  messagingSenderId: "690601667087",
  appId: "1:690601667087:web:c4ef2a97ffe3ae7346917a",
  measurementId: "G-BFJGBXWERL"

  };
  

  const app = initializeApp(firebaseConfig);
  
  export const auth = getAuth(app);
  export const provider = new GoogleAuthProvider();
  export const db = getFirestore(app);