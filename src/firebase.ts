// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBi8QAa8TXHP83e6xf0GsP8QAZb3IaXx0A',
  authDomain: 'app-crucianelli.firebaseapp.com',
  projectId: 'app-crucianelli',
  storageBucket: 'app-crucianelli.firebasestorage.app',
  messagingSenderId: '1048947205868',
  appId: '1:1048947205868:web:72255373e26d1fc63b67c9',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export firestore database
// It will be used in other parts of the app
export const db = getFirestore(app);
