// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfTmThSiiCOYDAHeIJyHzXn2sUVLLB5HU",
  authDomain: "smartor-graph.firebaseapp.com",
  projectId: "smartor-graph",
  storageBucket: "smartor-graph.appspot.com",
  messagingSenderId: "705158741168",
  appId: "1:705158741168:web:82953118c25c3bfd9b4f75",
  measurementId: "G-KDM8326VMZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
