import firebase from "firebase";
// var admin = require("firebase-admin");
// var serviceAccount = require("../../serviceAccount.json");

const firebaseConfig = {
  apiKey: "AIzaSyDHDDqkKs-J7dpu9ExMj2_MRaAJniot05U",
  authDomain: "hciproject-10f0d.firebaseapp.com",
  databaseURL: "https://hciproject-10f0d.firebaseio.com",
  projectId: "hciproject-10f0d",
  storageBucket: "hciproject-10f0d.appspot.com",
  messagingSenderId: "2723387961",
  appId: "1:2723387961:web:3f7370facd8460508bcbe8",
  measurementId: "G-VV9ZW5ENJE",
};
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: firebaseConfig.databaseURL,
// });
firebase.initializeApp(firebaseConfig);
export default firebase;
