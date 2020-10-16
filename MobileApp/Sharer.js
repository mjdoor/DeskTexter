import React, { useEffect, useRef } from "react";
import {
  View,
  Share,
  Text,
  TouchableOpacity,
  Animated,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/styles";

const Sharer = props => {
  let buttonAnimationValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (props.content !== "") {
      bringButtonIn();
    }
  }, [props.content]);

  const bringButtonIn = () => {
    Animated.timing(buttonAnimationValue, {
      toValue: 1,
      duration: 300
    }).start();
  };

  const onShare = () => {
    Animated.timing(buttonAnimationValue, {
      toValue: 100,
      duration: 900
    }).start(async () => {
      try {
        const result = await Share.share({
          message: props.content
        });
        if (result.action === Share.sharedAction) {
          setTimeout(props.onSend, 2000);
        } else if (result.action === Share.dismissedAction) {
          bringButtonIn();
        }
      } catch (error) {
        alert(error.message);
      }
    });
  };

  const handlePressIn = () => {
    Animated.timing(buttonAnimationValue, {
      toValue: 0.9,
      duration: 200
    }).start();
  };

  return (
    <View style={{ justifyContent: "center" }}>
      {props.content === "" ? (
        <View
          style={{
            alignItems: "center"
          }}
        >
          <Ionicons
            name={Platform.OS === "android" ? "md-happy" : "ios-happy"}
            size={100}
          />
          <Text>Ready</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPress={onShare}
          activeOpacity={1}
        >
          <Animated.View
            style={{
              ...styles.shareButton,
              opacity: Animated.divide(1, buttonAnimationValue),
              transform: [{ scale: buttonAnimationValue }]
            }}
          >
            <Text style={styles.shareText}>SHARE</Text>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Sharer;
