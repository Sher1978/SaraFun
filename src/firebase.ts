import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBIxNIZLHnfXGogTMkkHjyeomjPNsTYIzE",
    authDomain: "sarafun-777.firebaseapp.com",
    projectId: "sarafun-777",
    storageBucket: "sarafun-777.firebasestorage.app",
    messagingSenderId: "994908147296",
    appId: "1:994908147296:web:b3751a43bc169efff9fd05"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
