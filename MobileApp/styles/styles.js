import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 80,
    paddingHorizontal: 30,
    height: "100%",
    backgroundColor: "#9EB1B8",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between"
  },
  shareButton: {
    height: 200,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    backgroundColor: "#8E282C",
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20
  },
  shareText: {
    fontSize: 20,
    color: "white"
  },
  title: {
    color: "black",
    fontSize: Math.round(Dimensions.get("window").width) / 7,
    fontWeight: "bold",
    textShadowColor: "white",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  signoutButton: {
    fontWeight: "bold"
  }
});

export default styles;
