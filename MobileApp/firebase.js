import * as firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "<REDACTED>",
  authDomain: "desktexter.firebaseapp.com",
  databaseURL: "https://desktexter.firebaseio.com",
  projectId: "desktexter",
  storageBucket: "desktexter.appspot.com",
  messagingSenderId: "<REDACTED>",
  appId: "<REDACTED>",
  measurementId: "<REDACTED>"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const firestore = firebase.firestore(firebaseApp);
