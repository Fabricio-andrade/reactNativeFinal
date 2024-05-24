// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbUtRj0Lsv4iLoLqZJ8fNySe2gvQgBXCE",
  authDomain: "dbcrud-d1149.firebaseapp.com",
  databaseURL: "https://dbcrud-d1149-default-rtdb.firebaseio.com",
  projectId: "dbcrud-d1149",
  storageBucket: "dbcrud-d1149.appspot.com",
  messagingSenderId: "498612076522",
  appId: "1:498612076522:web:826c6e0db96a06d9c27c93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export { db };