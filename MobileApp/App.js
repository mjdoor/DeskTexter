import React, { useEffect, useReducer } from "react";
import {
  Text,
  View,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";

import Login from "./Login";
import Sharer from "./Sharer";
import styles from "./styles/styles";

import { firebaseApp, firestore } from "./firebase";

console.disableYellowBox = true;

export default function App() {
  const initialState = {
    isPending: true,
    isAuthenticated: false,
    latestContent: ""
  };
  const reducer = (prevState, action) => {
    switch (action.type) {
      case "authenticated":
        return { ...prevState, isPending: false, isAuthenticated: true };
      case "unauthenticated":
        return { ...prevState, isPending: false, isAuthenticated: false };
      case "received_notification":
        return { ...prevState, latestContent: action.content };
      case "done_shared":
        return { ...prevState, latestContent: "" };
      default:
        return prevState;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        dispatch({ type: "authenticated" });
      } else {
        dispatch({ type: "unauthenticated" });
      }
    });

    Notifications.addListener(notification => {
      dispatch({
        type: "received_notification",
        content: notification.data.content
      });
    });
  }, []);

  const registerForPushNotificationsAsync = async userId => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        return;
      }
      let tkn = await Notifications.getExpoPushTokenAsync();
      addTokenToFirestore(userId, tkn);
    } else {
      Alert.alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.createChannelAndroidAsync("desktexter", {
        name: "desktexter",
        sound: true,
        priority: "max",
        vibrate: [0, 250, 250, 250]
      });
    }
  };

  const addTokenToFirestore = (uid, token) => {
    firestore
      .collection("users")
      .doc(uid)
      .set({ pushToken: token }, { merge: true })
      .then(() => console.log("Token saved!"))
      .catch(error => console.log("Token failed to save!"));
  };

  const handleDoneShared = () => {
    dispatch({ type: "done_shared" });
  };

  const logout = () => {
    firebaseApp
      .auth()
      .signOut()
      .catch(() => console.log("Logout failed"));
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>DeskTexter</Text>
      {state.isPending ? (
        <React.Fragment>
          <ActivityIndicator size="large" color="#8E282C" />
          <View />
        </React.Fragment>
      ) : state.isAuthenticated ? (
        <React.Fragment>
          <Sharer content={state.latestContent} onSend={handleDoneShared} />
          <TouchableOpacity onPress={logout}>
            <View style={{ padding: 20 }}>
              <Text style={styles.signoutButton}>SIGN OUT</Text>
            </View>
          </TouchableOpacity>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Login
            onLogin={userId => registerForPushNotificationsAsync(userId)}
          />
          <View />
        </React.Fragment>
      )}
    </View>
  );
}
