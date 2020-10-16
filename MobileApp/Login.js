import React, { useState } from "react";
import {
  Image,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from "react-native";
import signInImage from "./assets/google_sign_in.png";

import * as firebase from "firebase";
import * as Google from "expo-google-app-auth";
import { firebaseApp } from "./firebase";

const Login = props => {
  const [pending, setPending] = useState(false);

  const signIn = () => {
    setPending(true);
    Google.logInAsync({
      androidClientId:
        "<REDACTED>",
      /*iosClientId: "YOUR_iOS_CLIENT_ID",*/
      androidStandaloneAppClientId:
        "<REDACTED>",
      scopes: ["profile", "email"],
      behavior: "web" // added this because nothing was happening in standalone app
    })
      .then(result => {
        if (result.type === "success") {
          const { idToken, accessToken } = result;
          const credential = firebase.auth.GoogleAuthProvider.credential(
            idToken,
            accessToken
          );
          firebaseApp
            .auth()
            .signInWithCredential(credential)
            .then(res => {
              setPending(false);
              props.onLogin(res.user.uid);
            })
            .catch(error => {
              setPending(false);
              Alert.alert("Sign In Error", "Please try again.");
            });
        } else {
          setPending(false);
          Alert.alert("Authentication Failed", "Please try again.");
        }
      })
      .catch(error => {
        setPending(false);
        Alert.alert("Authentication Error", "Please try again.");
      });
  };

  return (
    <View>
      <TouchableOpacity onPress={signIn}>
        <Image source={signInImage} style={{ width: 250, height: 60 }} />
      </TouchableOpacity>
      {pending && <ActivityIndicator size="large" color="#8E282C" />}
    </View>
  );
};

export default Login;
