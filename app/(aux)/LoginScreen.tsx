import fbAuth from "@react-native-firebase/auth";
import {
  GoogleSignin,
  GoogleSigninButton,
  User,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as Application from "expo-application";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { auth } from "utils/firebase";

const LoginScreen = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [signInInProgress, setSignInInProgress] = useState(false);

  useEffect(() => {
    (async () => {
      setSignInInProgress(true);
      try {
        const userInfo = await GoogleSignin.signInSilently();
        setUserInfo(userInfo);
      } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_REQUIRED) {
          // user has not signed in yet
        } else {
          console.error("[EEEEEE]", error);
        }
      } finally {
        setSignInInProgress(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { idToken } = userInfo || {};

      if (!idToken) {
        return;
      }

      setSignInInProgress(true);
      const googleCredential = fbAuth.GoogleAuthProvider.credential(idToken);
      await auth.signInWithCredential(googleCredential);
      setSignInInProgress(false);
    })();
  }, [userInfo]);

  const signIn = async () => {
    try {
      setSignInInProgress(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUserInfo(userInfo);
    } catch (error: any) {
      console.error("[EEEEEE]", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert(
          "Sign in cancelled",
          "You have cancelled the sign in process",
        );
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        Alert.alert(
          "Sign in in progress",
          "You have already started the sign in process",
        );
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        Alert.alert(
          "Play services not available",
          "Google Play services are not available or outdated",
        );
      } else {
        // some other error happened
        Alert.alert("[signIn] Unknown error", error.toString());
      }
    } finally {
      setSignInInProgress(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />
      {signInInProgress ? <ActivityIndicator /> : null}
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Standard}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
        disabled={signInInProgress}
      />
      <View style={{ flex: 1 }} />
      <View style={{ marginVertical: 16 }}>
        <Text
          variant="labelSmall"
          style={{ textAlign: "center", color: "#ccc" }}
        >
          Version: {Application.nativeApplicationVersion}-
          {Application.nativeBuildVersion}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {},
});

export default LoginScreen;
