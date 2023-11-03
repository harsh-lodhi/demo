import { ActivityIndicator } from "react-native-paper";
import { auth } from "../utils/firebase";
import { useEffect, useState } from "react";
import AppLayout from "./(aux)/AppLayout";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { StyleSheet, View } from "react-native";
import LoginScreen from "./(aux)/LoginScreen";
import { useUser } from "../hooks/useUserInfo";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const Layout = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useUser();

  async function onAuthStateChanged(_user: FirebaseAuthTypes.User | null) {
    const idTokenResult = await _user?.getIdTokenResult();

    let userData = null;
    if (_user) {
      userData = {
        ...(_user.toJSON() as FirebaseAuthTypes.User),
        claims: idTokenResult?.claims,
      };
    }

    setUser(userData);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth.onIdTokenChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "48500871705-bjqg5jtgiaj3128oimcd3vjpjvlqke5r.apps.googleusercontent.com",
    });
  }, []);

  if (initializing) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return user ? <AppLayout /> : <LoginScreen />;
};

const styles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Layout;
