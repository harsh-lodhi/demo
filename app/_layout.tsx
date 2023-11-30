import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AppLayout from "app/(aux)/AppLayout";
import LoginScreen from "app/(aux)/LoginScreen";
import { useUser } from "hooks/useUserInfo";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { auth } from "utils/firebase";

const Layout = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useUser();

  const onAuthStateChanged = useCallback(
    async (_user: FirebaseAuthTypes.User | null) => {
      const idTokenResult = await _user?.getIdTokenResult();

      let userData = null;
      if (_user) {
        userData = {
          ...(_user.toJSON() as FirebaseAuthTypes.User),
          claims: idTokenResult?.claims,
          idTokenResult,
        };
      }

      setUser(userData);
      if (initializing) setInitializing(false);
    },
    [initializing, setUser],
  );

  useEffect(() => {
    const subscriber = auth.onIdTokenChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [onAuthStateChanged]);

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
