import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { BackHandler } from "react-native";
import { ButtonLink, BackButton } from "./Button";

describe("ButtonLink", () => {
  it("should navigate to the specified href when clicked", () => {
    const href = "/path/to/page";
    const replace = false;
    const { getByText } = render(
      <ButtonLink href={href} replace={replace}>
        Click me
      </ButtonLink>
    );
    fireEvent.press(getByText("Click me"));
    expect(router.getCurrentRoute()).toEqual(href);
  });

  it("should replace the current route with the specified href when replace is true", () => {
    const href = "/path/to/page";
    const replace = true;
    const { getByText } = render(
      <ButtonLink href={href} replace={replace}>
        Click me
      </ButtonLink>
    );
    fireEvent.press(getByText("Click me"));
    expect(router.getCurrentRoute()).toEqual(href);
  });
});

describe("BackButton", () => {
  it("should go back to the previous route when clicked and there is a previous route", () => {
    const { getByText } = render(<BackButton>Back</BackButton>);
    router.push("/path/to/page");
    fireEvent.press(getByText("Back"));
    expect(router.getCurrentRoute()).toEqual("/");
  });

  it("should exit the app when clicked and there is no previous route", () => {
    const { getByText } = render(<BackButton>Back</BackButton>);
    router.push("/");
    fireEvent.press(getByText("Back"));
    expect(BackHandler.exitApp).toHaveBeenCalled();
  });
});
