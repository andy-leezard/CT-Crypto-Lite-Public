import firebase from 'firebase/app';
import "firebase/firestore";
import "firebase/database";
import "firebase/auth";

// Optionally import the services that you want to use
//import "firebase/functions";
//import "firebase/storage";

// Initialize Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "apiKey",
    authDomain: "authDomain",
    projectId: "projectId",
    storageBucket: "storageBucket",
    messagingSenderId: "messagingSenderId",
    appId: "appId",
    measurementId: "measurementId",
    databaseURL: "databaseURL"
  };

let app;
if(firebase.apps.length === 0){
    app = firebase.initializeApp(firebaseConfig);
}else{
    app = firebase.app();
}

const rdb = app.database();
const db = app.firestore();
const auth = firebase.auth();

export {db, auth, rdb};