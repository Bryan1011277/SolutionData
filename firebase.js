const firebaseConfig = {
  apiKey: "AIzaSyDnLhw5_GPDgIz3PQsPq4A02rTq9O5XIT0",
  authDomain: "solutiondata.firebaseapp.com",
  projectId: "solutiondata",
  storageBucket: "solutiondata.firebasestorage.app",
  messagingSenderId: "990826911931",
  appId: "1:990826911931:web:de996307732bbc54a6319e",
  measurementId: "G-MCWZ94EZM1"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();