// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAY9nbjXqZMEJoE7hqicjCBK07wZxBl804",
  authDomain: "hahaweb-784a3.firebaseapp.com",
  projectId: "hahaweb-784a3",
  storageBucket: "hahaweb-784a3.appspot.com",
  messagingSenderId: "1025506231116",
  appId: "1:1025506231116:web:3f49c4dc4a4c98129605e9",
  measurementId: "G-1DVM022QV0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);