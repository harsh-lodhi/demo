import { router } from "expo-router";
import React, { useCallback } from "react";
import { BackHandler } from "react-native";
import { Button, ButtonProps } from "react-native-paper";

interface ButtonLinkProps extends ButtonProps {
  href: string;
  replace?: boolean;
  children: React.ReactNode;
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  href,
  replace,
  children,
  ...props
}) => {
  const handlePress = useCallback(() => {
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  }, [href, replace]);

  return (
    <Button {...props} onPress={handlePress}>
      {children}
    </Button>
  );
};

interface BackButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = (props) => {
  const handlePress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      BackHandler.exitApp();
    }
  }, []);

  return <Button {...props} onPress={handlePress} />;
};
